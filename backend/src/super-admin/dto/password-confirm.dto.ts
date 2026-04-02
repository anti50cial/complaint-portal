import { IsString, IsNotEmpty } from 'class-validator';

export class PasswordConfirmDto {
  @IsString()
  @IsNotEmpty()
  password!: string;
}
