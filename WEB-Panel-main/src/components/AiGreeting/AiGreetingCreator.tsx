'use client';
import React, { useState } from 'react';
import VoiceClone from './VoiceClone/VoiceClone';
import { AiGreeting, AiGreetingState, PublishedMemorial } from '@/types/memorial';
import ImageSelection from './ImageSelection/ImageSelection';
import { getAiMemorialGreeting } from '@/services/server/memorial';
import Pending from './Pending/Pending';
import Result from './Result/Result';
interface AiGreetingProps {
  memorial: PublishedMemorial;
  greeting: AiGreeting | null;
}

type AiGreetingStage = 'audio' | 'image' | 'pending' | 'result';

function AiGreetingCreator({ memorial, greeting }: AiGreetingProps) {
  const [stage, setStage] = useState<AiGreetingStage>(getStage(greeting));
  const [currentGreeting, setCurrentGreeting] = useState<AiGreeting | null>(greeting);

  const refresh = async () => {
    const aiGreeting = await getAiMemorialGreeting(memorial.id);

    setStage(getStage(aiGreeting));
    setCurrentGreeting(aiGreeting);
  };

  return (
    <>
      {stage === 'audio' && <VoiceClone memorial={memorial} onComplete={refresh} />}
      {stage === 'image' && currentGreeting?.audioPath && (
        <ImageSelection
          audioPath={currentGreeting.audioPath}
          onComplete={refresh}
          memorial={memorial}
        />
      )}
      {stage === 'pending' && <Pending refreshStatus={refresh} memorial={memorial} />}
      {stage === 'result' && currentGreeting?.videoPath && (
        <Result memorial={memorial} videoPath={currentGreeting.videoPath} refresh={refresh} />
      )}
    </>
  );
}

export default AiGreetingCreator;

function getStage(greeting: AiGreeting | null): AiGreetingStage {
  if (!greeting) {
    return 'audio';
  }
  if (greeting.videoPath && greeting.state === AiGreetingState.COMPLETED) {
    return 'result';
  }
  if (greeting.audioPath && !greeting.imagePath) {
    return 'image';
  }
  if (
    greeting.state === AiGreetingState.PROCESSING_AUDIO ||
    greeting.state === AiGreetingState.PROCESSING_VIDEO
  ) {
    return 'pending';
  }
  if (greeting.imagePath && greeting.audioPath) {
    return 'pending';
  }
  return 'audio';
}
