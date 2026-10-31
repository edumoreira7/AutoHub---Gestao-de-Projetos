import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ServicoCreateDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nome!: string;

    @IsNumber()
    @Min(0.01)
    precoPadrao!: number;

    @IsOptional()
    @IsBoolean()
    ativo?: boolean;
}
