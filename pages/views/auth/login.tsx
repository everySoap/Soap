import * as React from 'react';

import { parsePath } from '@pages/common/utils';
import { Button } from '@pages/components/Button';
import { Input } from '@pages/components/Input';
import { withAuth } from '@pages/components/router/withAuth';
import { Router } from '@pages/routes';
import { AccountStore } from '@pages/stores/AccountStore';
import { inject, observer } from 'mobx-react';
import { withRouter, WithRouterProps } from 'next/router';
import { Title, Wrapper } from './styles';

interface IProps extends WithRouterProps {
  accountStore: AccountStore;
}

const Login: React.FC<IProps> = ({ accountStore, router }) => {
  const { query } = parsePath(router!.asPath!);
  const { login } = accountStore;
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      await login(username, password);
      if (query.redirectUrl) {
        Router.replaceRoute(query.redirectUrl);
      } else {
        Router.replaceRoute('/');
      }
    } finally {
      setConfirmLoading(false);
    }
  };
  return (
    <Wrapper>
      <Title>登录</Title>
      <Input
        type="text"
        placeholder="用户名"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <Input
        type="password"
        value={password}
        placeholder="密码"
        style={{ marginTop: '18px' }}
        onPressEnter={handleOk}
        onChange={e => setPassword(e.target.value)}
      />
      <Button
        loading={confirmLoading}
        style={{ marginTop: '24px' }}
        onClick={handleOk}
      >
        登录
      </Button>
    </Wrapper>
  );
};

export default withAuth<IProps>('guest')(
  inject('accountStore')(
    observer(
      withRouter(
        Login,
      ),
    ),
  ),
);
