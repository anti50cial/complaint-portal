import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class BatchDeleteDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  ids: string[];

  @IsString()
  @IsNotEmpty()
  password: string;
}
