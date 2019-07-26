import { WithRouterProps } from 'next/dist/client/with-router';
import { withRouter } from 'next/router';
import React from 'react';

import { connect } from '@lib/common/utils/store';
import { Link } from '@lib/routes';
import { ThemeStore } from '@lib/stores/ThemeStore';
import { Btns } from './Btns';
import { Icon } from './Icon';
import { Logo, MenuWapper, Wrapper } from './styles';

interface IProps extends WithRouterProps {
  themeStore?: ThemeStore;
}

export const Header = withRouter<IProps>(
  connect('themeStore')(
    ({ router, themeStore }) => {
      const isLog = /^\/views\/auth\//.test(router!.pathname);
      return (
        <Wrapper login={isLog}>
          <Logo>
            <Link route="/">
              <a style={{ fontSize: 0 }} href="/">
                <Icon
                  color={themeStore!.themeData.layout.header.logo}
                />
              </a>
            </Link>
          </Logo>
          <MenuWapper>
            {/* <MenuItem>首页</MenuItem> */}
          </MenuWapper>
          {
            !isLog &&
            <Btns />
          }
        </Wrapper>
      );
    },
  ),
);