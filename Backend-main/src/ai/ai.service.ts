import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { env, getBaseURL } from 'src/config/env';
import { MemorialEntity } from 'src/entities/MemorialEntity';
import { MemorialStatus, TimelineMemory } from 'src/memorial/interface/memorial.interface';
import { StorageService } from 'src/storage/storage.service';
import * as fs from 'fs/promises';
import { generateAssetUrl, generateVersionedFilePath } from 'src/util/asset';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import {
  AiGreeting,
  AiGreetingState,
  GenerateHeygenVideoConfig,
  GoEnchanceAICreateResponse,
  GoEnchanceAIStatusResponse,
  HeygenAsset,
  HeygenImageUploadResponse,
  HeygenVideoGenerateResponse,
  HeygenVideoStatusResponse,
} from './interface/ai.interface';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createBufferFromStream, multerToDomFile } from 'src/util/file';
import { GO_ENHANCE_AI_EFFECT_IDS, GREETING_VOICE_TEXTS } from './config/ai.config';
import { InjectRepository } from '@nestjs/typeorm';
import { AiGreetingEntity } from 'src/entities/AiGreetingEntity';
import { Repository } from 'typeorm';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private googleGenAI: GoogleGenAI = new GoogleGenAI({
    apiKey: env.googleGenAI.apiKey,
  });
  private elevenLabsClient: ElevenLabsClient = new ElevenLabsClient({
    apiKey: env.elevenLabs.apiKey,
    environment: 'https://api.elevenlabs.io',
  });

  constructor(
    private readonly storageService: StorageService,
    private readonly httpService: HttpService,
    @InjectRepository(AiGreetingEntity)
    private readonly aiGreetingRepository: Repository<AiGreetingEntity>,
  ) {}

  async transcribeAudio(file: Express.Multer.File): Promise<string | undefined> {
    const result = await this.googleGenAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Transcribe the following audio as accurately as possible, with punctuation and proper casing.',
            },
            {
              inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') },
            },
          ],
        },
      ],
    });
    return result.text;
  }

  async generateTimeline(memorial: MemorialEntity): Promise<TimelineMemory[]> {
    const { dateOfBirth, dateOfDeath, memories, name } = memorial;
    if (memories.length === 0) {
      return [];
    }

    const memoriesData = memories.map((memory) => ({
      date: memory.date,
      content: memory.content,
      memoryId: memory.id,
    }));

    const result = await this.googleGenAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are a timeline generator. Given an array of memories, create a timeline entry for each one.
A timeline is the list of important events in a person's life. You will also be provided the persons name to help you understand the context of the memories.
Memories are written by people close to the deceased, so they may contain personal anecdotes, emotions, and subjective viewpoints.
For each memory, generate:
- A concise, meaningful title (3-8 words) that captures the essence of the memory
- A one-sentence description that summarizes the memory

Always include birth and death as first and last entries in the timeline, if the dates are available.

Detect the language of the memories and respond in the same language.

The descriptions and titles should be generic and not from a specific point of view. It should be as if an encyclopedia is describing the event. Here are some examples:
Title: "Graduation Day"
Description: "{name here} graduated from Harvard University with honors, marking a significant milestone in his academic journey."

Title: "First Job at TechCorp"
Description: "{name here} began his professional career at TechCorp, where he contributed to innovative projects in software development."

Title: "Camping Trip to Yellowstone"
Description: "{name here} went on a memorable camping trip to Yellowstone National Park, where he explored the stunning landscapes and wildlife."

Name of the deceased: ${name ?? 'N/A'}
Date of Birth: ${dateOfBirth ?? 'N/A'}
Date of Death: ${dateOfDeath ?? 'N/A'}

Here are the memories:
${JSON.stringify(memoriesData, null, 2)}

Return your response as a valid JSON array with objects containing "date", "title", "description", and "memoryId" fields. 
Ensure the description is exactly one sentence.
Memory ID should correspond to the original memory's ID.
Do not return memoryIds for birth and as they do not correspond to any specific memory.
`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'The date of the memory in YYYY-MM-DD format',
              },
              title: {
                type: 'string',
                description: 'A concise title for the memory (3-8 words)',
              },
              description: {
                type: 'string',
                description: 'A one-sentence description of the memory',
              },
              memoryId: {
                type: 'string',
                description: 'The ID of the original memory',
              },
            },
            required: ['date', 'title', 'description'],
          },
        },
      },
    });
    if (!result.text) {
      throw new HttpException('Failed to generate timeline', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const timeline: TimelineMemory[] = JSON.parse(result.text) as TimelineMemory[];
    return timeline;
  }

  async generateLivePortrait(memorial: MemorialEntity): Promise<string | null> {
    try {
      if (!memorial.imagePath) {
        throw new HttpException('Memorial has no image', HttpStatus.BAD_REQUEST);
      }
      if (!memorial.isPremium) {
        throw new HttpException(
          'Live portraits can only be generated for premium memorials',
          HttpStatus.FORBIDDEN,
        );
      }
      if (memorial.status !== MemorialStatus.PUBLISHED) {
        throw new HttpException(
          'Live portraits can only be generated for published memorials',
          HttpStatus.FORBIDDEN,
        );
      }
      const portraitPath = await this.generatePortraitWithGoEnhance(memorial);
      return portraitPath;
    } catch (error) {
      this.logger.error('Failed to generate live portrait', error);
      return null;
    }
  }

  async generatePortraitWithGoEnhance(memorial: MemorialEntity): Promise<string | null> {
    const effect = memorial.livePortraitEffect || null;
    const memorialId = memorial.id;
    const imagePath = memorial.imagePath;

    if (!imagePath) {
      throw new HttpException('Memorial has no image', HttpStatus.BAD_REQUEST);
    }

    if (effect === null) {
      this.logger.warn('No effect specified for live portrait generation, skipping.');
      return null;
    }
    // Check if video exists for given image effect
    const videoPath = `memorial/${memorialId}/live-portrait/${imagePath.split('/').pop()?.split('.')[0]}-${effect}.mp4`;
    const exists = await this.storageService.exists(videoPath);
    if (exists) {
      this.logger.log(
        `Live portrait video already exists for memorial ${memorialId} and image ${imagePath} with effect ${effect}, skipping generation.`,
      );
      return videoPath;
    }

    const effectId = GO_ENHANCE_AI_EFFECT_IDS[effect];
    const imgUUID = await this.httpService.axiosRef
      .post(
        `https://api.goenhance.ai/api/v2/videoeffect/generate/${effectId}`,
        {
          args: {
            reference_img: `${getBaseURL()}/api/v1/asset/${imagePath}`,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.goEnhanceAI.apiKey}`,
          },
        },
      )
      .then((res: AxiosResponse<GoEnchanceAICreateResponse>) => {
        if (res.data.data?.img_uuid) {
          this.logger.log(
            `Image job submitted to GoEnhance AI, waiting for processing. ID: ${res.data.data.img_uuid}`,
          );
          return res.data.data.img_uuid;
        }
        throw new HttpException('Failed to create image job', HttpStatus.INTERNAL_SERVER_ERROR);
      })
      .catch((error) => {
        this.logger.error('Error submitting job to GoEnhance AI', error);
        throw new HttpException('Failed to create image job', HttpStatus.INTERNAL_SERVER_ERROR);
      });

    let jobStatus = 'pending';
    let videoUrl: string | undefined = undefined;
    while (jobStatus === 'pending' || jobStatus === 'processing') {
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds before checking status again
      const statusRes = await this.httpService.axiosRef
        .get(`https://api.goenhance.ai/api/v1/jobs/detail?img_uuid=${imgUUID}`, {
          headers: {
            Authorization: `Bearer ${env.goEnhanceAI.apiKey}`,
          },
        })
        .then((res: AxiosResponse<GoEnchanceAIStatusResponse>) => {
          return res.data.data;
        });
      if (statusRes && statusRes.status === 'success') {
        jobStatus = 'success';
        videoUrl = statusRes.json?.[0]?.value;
      } else if (statusRes && (statusRes.status === 'failed' || statusRes.status === 'error')) {
        jobStatus = 'failed';
        this.logger.error('GoEnhance AI job failed', JSON.stringify(statusRes));
        throw new HttpException('Image generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        this.logger.log(`GoEnhance AI job status: ${statusRes?.status} for task ID: ${imgUUID}`);
      }
    }
    this.logger.log(`GoEnhance AI job completed with status: ${jobStatus}`);

    if (videoUrl) {
      const tempPath = `./tmp/goenhance_${Date.now()}.mp4`;
      const response = await this.httpService.axiosRef
        .get(videoUrl, {
          responseType: 'arraybuffer',
        })
        .then((res: { data: string }) => res);

      await fs.writeFile(tempPath, response.data);

      await new Promise((resolve) => setTimeout(resolve, 5000));
      const videoBuffer = await fs.readFile(tempPath);

      await this.storageService.save(videoPath, videoBuffer);
      this.logger.log(
        `Saved live portrait video to storage for memorial ${memorialId} at path ${videoPath}`,
      );
      await fs.unlink(tempPath);
      return videoPath;
    }
    return null;
  }

  async generatePortraitWithGoogleGenAI(memorialId: string, imagePath: string): Promise<string> {
    const prompt = `Bring life to an old portrait of this person. Apply gentle, lifelike movements that honor the memory of this person:
    Person starts looking to the distance towards the left side of the image.
    Then Person in the portrait smiles looks towards the camera.
    Person does not speak.
    The movements of the person and camera should be smooth and natural, avoiding any abrupt or exaggerated motions. It should be very sublte and respectful.
    Do not generate any text or captions in the video. Do not generate any audio in the video.
    "`;
    const [image, metadata] = await Promise.all([
      this.storageService.download(imagePath),
      this.storageService.getMetadata(imagePath),
    ]);
    if (!image || !metadata) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    let operation = await this.googleGenAI.models.generateVideos({
      model: 'veo-3.0-fast-generate-001',
      prompt: prompt,
      image: {
        imageBytes: image.toString('base64'),
        mimeType: metadata.contentType || 'image/jpeg',
      },
      config: {
        durationSeconds: 6,
      },
    });
    this.logger.log('Video generation started, waiting for completion...');
    while (!operation.done) {
      this.logger.log('Waiting for video generation to complete...');
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await this.googleGenAI.operations.getVideosOperation({
        operation: operation,
      });
    }
    this.logger.log('Video generation completed.');
    const generations = operation?.response?.generatedVideos;
    if (!generations || generations.length === 0 || !generations[0].video) {
      throw new HttpException(`Video generation failed`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const videoPath = generateVersionedFilePath(`memorial/${memorialId}/live-portrait.mp4`);
    const tempPath = `./tmp/veo3_${Date.now()}.mp4`;

    await this.googleGenAI.files.download({
      file: generations[0].video,
      downloadPath: tempPath,
    });
    // Wait a bit to ensure file is written
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // Read the file and upload to GCS
    const videoBuffer = await fs.readFile(tempPath);
    await this.storageService.save(videoPath, videoBuffer);
    // Clean up temp file
    await fs.unlink(tempPath);

    return videoPath;
  }

  async createMemorialVoice(memorialId: string, files: Express.Multer.File[]): Promise<string> {
    const voiceName = `memorial-voice-${memorialId}`;
    const existingVoices = await this.elevenLabsClient.voices.search({ search: voiceName });
    if (existingVoices.voices.length > 0) {
      this.logger.log(`Voice already exists for memorial ${memorialId}, deleting existing voice.`);
      await this.deleteMemorialVoice(existingVoices.voices[0].voiceId);
    }
    const createVoiceResponse = await this.elevenLabsClient.voices.ivc.create({
      name: voiceName,
      files: files.map((f) => multerToDomFile(f)),
    });
    this.logger.log(
      `Created new voice for memorial ${memorialId}, voice ID: ${createVoiceResponse.voiceId}`,
    );
    return createVoiceResponse.voiceId;
  }

  async deleteMemorialVoice(voiceId: string): Promise<void> {
    try {
      await this.elevenLabsClient.voices.delete(voiceId);
      this.logger.log(`Deleted voice with ID: ${voiceId}`);
    } catch (error) {
      this.logger.error(`Failed to delete voice with ID: ${voiceId}`, error);
    }
  }

  async createMemorialGreetingAudio(
    memorialId: string,
    voiceId: string,
    lang: 'en' | 'tr' = 'tr',
  ): Promise<string> {
    const current = await this.aiGreetingRepository.findOne({
      where: { memorialId },
    });
    if (current) {
      this.logger.log(
        `Greeting already exists for memorial ${memorialId}, language: ${lang}. Skipping creation.`,
      );
      throw new HttpException('Greeting already exists', HttpStatus.CONFLICT);
    }
    const entry = this.aiGreetingRepository.create({
      memorialId,
      state: AiGreetingState.PROCESSING_AUDIO,
    });
    try {
      await this.aiGreetingRepository.save(entry);
      const audio = await this.elevenLabsClient.textToSpeech.convert(voiceId, {
        text: GREETING_VOICE_TEXTS[lang],
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
        voiceSettings: {
          speed: 0.94,
          stability: 0.45,
          similarityBoost: 0.95,
          style: 0.15,
          useSpeakerBoost: true,
        },
      });
      const tmpPath = `./tmp/memorial_greeting_${memorialId}_${Date.now()}.mp3`;
      const buffer = await createBufferFromStream(audio);
      await fs.writeFile(tmpPath, buffer);
      const audioBuffer = await fs.readFile(tmpPath);
      const audioPath = generateVersionedFilePath(`memorial/${memorialId}/greeting_${lang}.mp3`);
      await this.storageService.save(audioPath, audioBuffer);
      await this.aiGreetingRepository.update(
        { memorialId },
        { state: AiGreetingState.READY, audioPath },
      );
      await fs.unlink(tmpPath);
      return audioPath;
    } catch (error) {
      this.logger.error(`Failed to create greeting for memorial ${memorialId}`, error);
      await this.aiGreetingRepository.update({ memorialId }, { state: AiGreetingState.ERROR });
      throw error;
    }
  }

  async uploadAssetToHeygen(file: File, contentType: string): Promise<HeygenAsset> {
    const uploadResult = await this.httpService.axiosRef
      .post('https://upload.heygen.com/v1/asset', file, {
        headers: {
          Authorization: `Bearer ${env.heyGen.apiKey}`,
          'Content-Type': contentType,
        },
      })
      .then((res: AxiosResponse<HeygenImageUploadResponse>) => res.data);
    if (!uploadResult.data) {
      this.logger.error('Failed to upload asset to HeyGen', JSON.stringify(uploadResult));
      throw new HttpException('Failed to upload asset to HeyGen', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return {
      id: uploadResult.data.id,
      type: uploadResult.data.file_type,
      image_key: uploadResult.data.image_key || null,
      url: uploadResult.data.url,
    };
  }

  async deleteHeygenAsset(assetId: string): Promise<void> {
    await this.httpService.axiosRef
      .post(`https://api.heygen.com/v1/asset/${assetId}/delete`, null, {
        headers: { Authorization: `Bearer ${env.heyGen.apiKey}` },
      })
      .then(() => {
        this.logger.log(`Deleted HeyGen asset with ID: ${assetId}`);
      })
      .catch((error) => {
        this.logger.error(`Failed to delete HeyGen asset with ID: ${assetId}`, error);
      });
  }

  async generateHeygenGreetingVideo(
    memorialId: string,
    imagePath: string,
    greetingAudioPath: string,
  ) {
    this.logger.log(`Starting HeyGen greeting video generation for memorial ${memorialId}`);
    const [image, audio, metadata] = await Promise.all([
      this.storageService.download(imagePath),
      this.storageService.download(greetingAudioPath),
      this.storageService.getMetadata(imagePath),
    ]);
    if (!image || !metadata) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    const file = new File([new Uint8Array(image)], 'image.jpg', {
      type: metadata.contentType || 'image/jpeg',
    });
    const audioFile = new File([new Uint8Array(audio || Buffer.from(''))], 'greeting.mp3', {
      type: 'audio/mpeg',
    });
    const [audioAsset, imageAsset] = await Promise.all([
      this.uploadAssetToHeygen(audioFile, 'audio/mpeg'),
      this.uploadAssetToHeygen(file, metadata.contentType || 'image/jpeg'),
    ]);
    this.logger.log(
      `Uploaded assets to HeyGen for memorial ${memorialId}, Image ID: ${imageAsset.id}, Audio ID: ${audioAsset.id}`,
    );

    if (!imageAsset.image_key) {
      this.logger.error('Uploaded image asset has no image key', JSON.stringify(imageAsset));
      throw new HttpException(
        'Failed to upload image asset to HeyGen',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const videoUrl = await this.generateHeygenMemorialVideoWithRetries({
      imageKey: imageAsset.image_key,
      audioUrl: audioAsset.url,
      videoTitle: `greeting-${memorialId}`,
      maxRetries: 8,
    });
    this.logger.log(`Generated HeyGen greeting video for memorial ${memorialId}, URL: ${videoUrl}`);

    await Promise.all([
      this.deleteHeygenAsset(audioAsset.id),
      this.deleteHeygenAsset(imageAsset.id),
    ]);

    this.logger.log(`Deleted temporary HeyGen assets for memorial ${memorialId}`);

    const tempPath = `./tmp/heygen_greeting_${Date.now()}.mp4`;
    const response = await this.httpService.axiosRef
      .get(videoUrl, {
        responseType: 'arraybuffer',
      })
      .then((res: { data: string }) => res);

    await fs.writeFile(tempPath, response.data);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    const videoBuffer = await fs.readFile(tempPath);
    const videoPath = generateVersionedFilePath(`memorial/${memorialId}/greeting.mp4`);

    await this.storageService.save(videoPath, videoBuffer);
    await this.aiGreetingRepository.update(
      { memorialId },
      { videoPath, state: AiGreetingState.COMPLETED },
    );
    await fs.unlink(tempPath);

    this.logger.log(`Saved greeting video to storage for memorial ${memorialId}`);
    return videoPath;
  }

  async generateHeygenMemorialVideoWithRetries({
    imageKey,
    audioUrl,
    videoTitle,
    maxRetries,
  }: GenerateHeygenVideoConfig): Promise<string> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const res = await this.httpService.axiosRef
          .post(
            'https://api.heygen.com/v2/video/av4/generate',
            {
              image_key: imageKey,
              video_title: videoTitle,
              audio_url: audioUrl,
              video_orientation: 'landscape',
              custom_motion_prompt:
                'Warm and friendly greeting video with subtle movements. Low expresiveness.',
            },
            { headers: { Authorization: `Bearer ${env.heyGen.apiKey}` } },
          )
          .then((res: AxiosResponse<HeygenVideoGenerateResponse>) => res.data);
        if (!res.data?.video_id) {
          this.logger.error('Failed to start video generation with HeyGen', JSON.stringify(res));
          throw new HttpException(
            'Failed to start video generation with HeyGen',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        const videoUrl = await this.pollHeygenVideoGeneration(res.data.video_id);
        return videoUrl;
      } catch (error) {
        this.logger.warn(`Attempt ${attempt + 1} to generate HeyGen video failed.`, error);
        attempt++;
        if (attempt >= maxRetries) {
          this.logger.error(`All attempts to generate HeyGen video failed.`, error);
          throw new HttpException(
            'Failed to generate video with HeyGen after multiple attempts',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }
    throw new HttpException(
      'Failed to generate video with HeyGen after multiple attempts',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async pollHeygenVideoGeneration(videoId: string): Promise<string> {
    let jobComplete = false;
    const maxWaitTime = 10 * 60 * 1000; // 10 minutes
    const jobStart = Date.now();
    let finalVideoUrl = '';
    while (!jobComplete) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      const res = await this.httpService.axiosRef
        .get(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
          headers: { Authorization: `Bearer ${env.heyGen.apiKey}` },
        })
        .then((res: AxiosResponse<HeygenVideoStatusResponse>) => res.data);
      const status = res.data?.status;
      const videoUrl = res.data?.video_url;
      if (status === 'failed') {
        this.logger.warn(`HeyGen video generation failed for video ID: ${videoId}`);
        throw new HttpException('HeyGen video generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
      } else if (status !== 'completed') {
        this.logger.log(
          `HeyGen video ID: ${videoId} status: ${status}. Elapsed time: ${
            (Date.now() - jobStart) / 1000
          } seconds.`,
        );
        continue;
      } else if (status === 'completed' && videoUrl) {
        this.logger.log(`HeyGen video generation completed for video ID: ${videoId}`);
        jobComplete = true;
        finalVideoUrl = videoUrl;
      } else {
        this.logger.log(
          `HeyGen video ID: ${videoId} status: ${status}. Elapsed time: ${
            (Date.now() - jobStart) / 1000
          } seconds.`,
        );
        if (Date.now() - jobStart > maxWaitTime) {
          this.logger.error(`HeyGen video generation timed out for video ID: ${videoId}`);
          throw new HttpException('HeyGen video generation timed out', HttpStatus.REQUEST_TIMEOUT);
        }
        continue;
      }
    }
    return finalVideoUrl;
  }

  async resetAiGreetingCreation(memorialId: string): Promise<void> {
    const current = await this.aiGreetingRepository.findOne({
      where: { memorialId },
    });
    if (!current) {
      return;
    }
    if (current.audioPath) {
      await this.storageService.delete(current.audioPath);
    }
    if (current.imagePath) {
      await this.storageService.delete(current.imagePath);
    }
    if (current.videoPath) {
      await this.storageService.delete(current.videoPath);
    }
    await this.aiGreetingRepository.delete({ memorialId });
  }

  async uploadAiGreetingImage(memorialId: string, file: Express.Multer.File): Promise<string> {
    const current = await this.aiGreetingRepository.findOne({
      where: { memorialId },
    });
    if (!current || !current.audioPath) {
      throw new HttpException('AI Greeting not found', HttpStatus.NOT_FOUND);
    }
    const imagePath = generateVersionedFilePath(`memorial/${memorialId}/greeting_image.jpg`);
    await this.storageService.save(imagePath, file.buffer);
    void this.generateHeygenGreetingVideo(memorialId, imagePath, current.audioPath);
    await this.aiGreetingRepository.update(
      { memorialId },
      { imagePath, state: AiGreetingState.PROCESSING_VIDEO },
    );
    return imagePath;
  }

  async getAiGreeting(memorialId: string): Promise<AiGreeting | null> {
    const greeting = await this.aiGreetingRepository.findOne({
      where: { memorialId },
    });
    if (!greeting) {
      return null;
    }
    return {
      memorialId: greeting.memorialId,
      audioPath: greeting.audioPath ? generateAssetUrl(greeting.audioPath) : null,
      imagePath: greeting.imagePath ? generateAssetUrl(greeting.imagePath) : null,
      videoPath: greeting.videoPath ? generateAssetUrl(greeting.videoPath) : null,
      state: greeting.state,
    };
  }
}
