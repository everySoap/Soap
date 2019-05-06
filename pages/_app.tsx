import * as _ from 'lodash';
import { Provider } from 'mobx-react';
import App, { Container } from 'next/app';
import Router from 'next/router';
import * as NProgress from 'nprogress';
import * as React from 'react';

import { server } from '@pages/common/utils';
import { CustomNextAppContext } from './common/interfaces/global';
import { BodyLayout } from './containers/BodyLayout';
import { ThemeWrapper } from './containers/Theme';
import { IInitialStore, IMyMobxStore, initStore } from './stores/init';

interface IPageProps {
  initialStore: IInitialStore;
  error?: {
    status: number;
    message?: string;
  };
}

Router.events.on('routeChangeStart', (url: string) => {
  console.log(`Loading: ${url}`);
  NProgress.start();
});
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default class MyApp extends App {
  public static async getInitialProps(data: CustomNextAppContext<any>) {
    const { ctx, Component } = data;
    let { req } = ctx as any;
    if (!req) req = {};
    const basePageProps: IPageProps = {
      initialStore: {
        accountStore: {
          userInfo: req.user,
        },
      },
    };
    let pageProps = {
      ...basePageProps,
    };
    ctx.mobxStore = pageProps.initialStore = initStore(pageProps.initialStore);
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({
        ...basePageProps,
        ...ctx,
      });
      pageProps = {
        ...pageProps,
        initialStore: _.merge(basePageProps.initialStore, pageProps.initialStore || {}),
      };
      ctx.mobxStore = pageProps.initialStore = initStore(pageProps.initialStore);
    }
    return {
      pageProps,
    };
  }
  public mobxStore: IMyMobxStore;

  constructor(props: any) {
    super(props);
    this.mobxStore = server ? props.pageProps.initialStore : initStore(props.pageProps.initialStore);
  }
  public render() {
    const { Component, pageProps } = this.props;
    console.log(this.props);
    return (
      <Container>
        <Provider {...this.mobxStore}>
          <ThemeWrapper>
            <BodyLayout>
              <Component
                {...pageProps}
              />
            </BodyLayout>
          </ThemeWrapper>
        </Provider>
      </Container>
    );
  }
}
