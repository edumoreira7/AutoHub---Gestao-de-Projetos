import { Global, Module } from '@nestjs/common';
import { LocalDataService } from './local-data.service.js';

@Global()
@Module({
    providers: [LocalDataService],
    exports: [LocalDataService],
})
export class LocalDataModule {}