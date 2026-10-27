import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserServiceDto } from './dto/create-user-service.dto';
import { UpdateUserServiceDto } from './dto/update-user-service.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserServiceService {
  constructor(private readonly userRepository: UserRepository) {}

  public async modifyName(newName: string, userId: string) {
    const updatedRows = await this.userRepository.updateName(newName, userId);
    if (updatedRows === 0) {
      throw new NotFoundException('User not found');
    }

    return { success: true, message: 'Name updated' };
  }

  public async modifyDisplayName(newDisplayName: string, userId: string) {
    const updatedRows = await this.userRepository.updateDisplayName(
      newDisplayName,
      userId,
    );
    if (updatedRows === 0) {
      throw new NotFoundException('User not found');
    }

    return { success: true, message: 'Display name updated' };
  }

  create(_createUserServiceDto: CreateUserServiceDto) {
    return 'This action adds a new userService';
  }

  findAll() {
    return 'This action returns all userService';
  }

  findOne(id: string) {
    return this.userRepository.findOne(id);
  }

  update(id: number, updateUserServiceDto: UpdateUserServiceDto) {
    return `This action updates a #${id} userService`;
  }

  remove(id: number) {
    return `This action removes a #${id} userService`;
  }
}
