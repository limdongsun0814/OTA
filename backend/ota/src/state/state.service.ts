import { Injectable } from '@nestjs/common';
import { StateDto } from './dto/state.dto';

@Injectable()
export class StateService {
  static store = new Map<string, StateDto>();

  static create(params: StateDto) {
    if (!this.store.has(params.chipId)) {
      this.store.set(params.chipId, {
        chipId: params.chipId,
        filePath: params.filePath,
        fileSize: params.fileSize,
        chunkSize: params.chunkSize,
        chunkMax: params.chunkMax,
        chunkIndex: 0,
      });
    }
    return this.store.get(params.chipId);
  }

  static get(chipId: string) {
    return this.store.get(chipId);
  }

  static remove(chipId: string) {
    this.store.delete(chipId);
  }
}
