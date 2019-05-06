import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { OauthMiddleware } from '@server/common/middleware/oauth.middleware';
import { PictureModule } from '@server/picture/picture.module';
import { ViewsController } from './views.controller';
import { ViewsService } from './views.service';

@Module({
  imports: [PictureModule],
  controllers: [ViewsController],
  providers: [
    ViewsService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ViewAuthGuard,
    // },
  ],
})
export class ViewsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OauthMiddleware)
      .forRoutes(ViewsController);
  }
}