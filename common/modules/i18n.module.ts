// import { Module } from '@nestjs/common';
// import {
//   AcceptLanguageResolver,
//   CookieResolver,
//   HeaderResolver,
//   I18nModule,
//   QueryResolver,
// } from 'nestjs-i18n';
// import { join } from 'path';

// @Module({
//   imports: [
//     I18nModule.forRootAsync({
//       useFactory: () => ({
//         fallbackLanguage: 'en',
//         loaderOptions: {
//           path: join(__dirname, '/i18n/'),
//           watch: true,
//         },
//       }),
//       resolvers: [
//         new HeaderResolver(['x-custom-lang']),
//         new QueryResolver(['lang', 'l']),
//         new CookieResolver(),
//         AcceptLanguageResolver,
//       ],
//     }),
//   ],
// })
// export class I18nConfigModule {}


import { Module } from '@nestjs/common';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: 'en',
        loaderOptions: {
          path: join(process.cwd(), 'dist/apps/user/i18n'),
          watch: false,
        },
      }),
      resolvers: [
        new HeaderResolver(['x-custom-lang']),
        new QueryResolver(['lang', 'l']),
        new CookieResolver(),
        AcceptLanguageResolver,
      ],
    }),
  ],
})
export class I18nConfigModule {}

