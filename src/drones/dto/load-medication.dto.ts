// src/drones/dto/load-medication.dto.ts
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoadMedicationDto {
  @ApiProperty({
    description: 'Array of medication IDs',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty({ each: true })
  medicationIds: number[];
}