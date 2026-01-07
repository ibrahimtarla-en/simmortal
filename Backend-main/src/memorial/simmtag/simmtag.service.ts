import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemorialEntity } from 'src/entities/MemorialEntity';
import { MemorialLocationEntity } from 'src/entities/MemorialLocationEntity';
import { Repository } from 'typeorm';
import { SimmTagLocation } from './interface/simmtag.interface';

@Injectable()
export class SimmTagService {
  constructor(
    @InjectRepository(MemorialLocationEntity)
    private memorialLocationRepository: Repository<MemorialLocationEntity>,
    @InjectRepository(MemorialEntity)
    private memorialRepository: Repository<MemorialEntity>,
  ) {}

  async createOrUpdateLocation(userId: string, memorialId: string, location: SimmTagLocation) {
    const memorial = await this.memorialRepository.findOne({
      where: { id: memorialId },
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    if (memorial.ownerId !== userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    if (!memorial.isPremium) {
      throw new HttpException('Memorial is not premium', HttpStatus.BAD_REQUEST);
    }
    const { latitude, longitude } = location;
    await this.memorialLocationRepository.upsert(
      {
        memorialId,
        latitude,
        longitude,
      },
      ['memorialId'],
    );
  }
}
