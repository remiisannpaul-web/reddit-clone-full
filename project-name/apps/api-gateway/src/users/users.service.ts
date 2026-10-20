import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersClient {
    private readonly baseUrl =
        process.env.USER_SERVICE_URL ?? 'http://localhost:3008';

    constructor(private readonly http: HttpService) {}

    findOne(id: string) {
        return firstValueFrom(this.http.get(`${this.baseUrl}/users/${id}`)).then(
            ({ data }) => data,
        );
    }

    modifyName(newName: string, userId: string) {
        return firstValueFrom(
            this.http.patch(`${this.baseUrl}/users/${userId}`, { newName, userId }),
        ).then(({ data }) => data);
    }

    modifyDisplayName(newDisplayName: string, userId: string) {
        return firstValueFrom(
            this.http.patch(`${this.baseUrl}/users/${userId}/display-name`, {
                newDisplayName,
                userId,
            }),
        ).then(({ data }) => data);
    }
}