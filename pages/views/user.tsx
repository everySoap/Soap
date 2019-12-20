import { useApolloClient } from 'react-apollo';
import { observer } from 'mobx-react';
import React, { useCallback, useState } from 'react';
import parse from 'url-parse';
import { rem } from 'polished';
import { withRouter } from 'next/router';
import { Cell } from 'styled-css-grid';

import { IBaseScreenProps, ICustomNextPage, ICustomNextContext } from '@lib/common/interfaces/global';
import { getTitle } from '@lib/common/utils';
import {
  Avatar, Nav, NavItem, EmojiText, SEO,
} from '@lib/components';
import { withError } from '@lib/components/withError';
import { PictureList } from '@lib/containers/Picture/List';
import { Link as LinkIcon } from '@lib/icon';
import {
  Bio,
  EditIcon,
  Profile,
  ProfileItem,
  ProfileItemLink,
  UserHeader,
  UserName,
  Wrapper,
  HeaderGrid,
  AvatarBox,
  Info,
  InfoItem,
  InfoItemCount,
  InfoItemLabel,
  InfoBox,
} from '@lib/styles/views/user';
import { WithRouterProps } from 'next/dist/client/with-router';
import { A } from '@lib/components/A';
import { CollectionList } from '@lib/containers/Collection/List';
import { UserType } from '@common/enum/router';
import { pageWithTranslation } from '@lib/i18n/pageWithTranslation';
import { I18nNamespace } from '@lib/i18n/Namespace';
import { useAccountStore, useStores } from '@lib/stores/hooks';
import { useTranslation } from '@lib/i18n/useTranslation';
import { FollowButton } from '@lib/components/Button/FollowButton';
import { FollowUser, UnFollowUser } from '@lib/schemas/mutations';
import { UserIsFollowing } from '@lib/schemas/query';
import { useWatchQuery } from '@lib/common/hooks/useWatchQuery';
import { throttle } from 'lodash';

interface IProps extends IBaseScreenProps, WithRouterProps {
  username: string;
  type: UserType;
}

const server = !!(typeof window === 'undefined');


const User = observer<ICustomNextPage<IProps, {}>>(({ type }) => {
  const { screen } = useStores();
  const { t } = useTranslation();
  const { userStore, userCollectionStore } = screen;
  const { user } = userStore;
  // const { type: PictureType, list } = userPictureStore;
  return (
    <Wrapper>
      <SEO
        title={getTitle(`${user.fullName} (@${user.username})`, t)}
        description={`${user.bio ? `${user.bio}-` : ''}查看${user.name}的Soap照片。`}
      />
      <UserInfo />
      <Nav>
        <NavItem route={`/@${user.username}`}>
          {t('user.menu.picture')}
        </NavItem>
        <NavItem route={`/@${user.username}/like`}>
          {t('user.menu.like')}
        </NavItem>
        <NavItem route={`/@${user.username}/collections`}>
          {t('user.menu.collection')}
        </NavItem>
      </Nav>
      {
        type === 'collections' ? (
          <CollectionList
            list={userCollectionStore.list}
            noMore={userCollectionStore.isNoMore}
          />
        ) : (
          <Picture />
        )
      }
    </Wrapper>
  );
});

const UserInfo = observer(() => {
  const { t } = useTranslation();
  const [followLoading, setFollowLoading] = useState(false);
  const { screen } = useStores();
  const { mutate } = useApolloClient();
  const [query] = useWatchQuery<{user: {isFollowing: number}}>(UserIsFollowing, { fetchPolicy: 'network-only' });
  const { isLogin, userInfo } = useAccountStore();
  const { userStore } = screen;
  const { user, setUserInfo } = userStore;
  const follow = useCallback(throttle(async () => {
    let mutation = FollowUser;
    if (user.isFollowing > 0) mutation = UnFollowUser;
    if (followLoading) return;
    setFollowLoading(true);
    try {
      await mutate<{done: boolean}>({
        mutation,
        variables: {
          input: {
            userId: user.id,
          },
        },
      });
      await query(({ user: newUserInfo }) => {
        setUserInfo(newUserInfo);
        setFollowLoading(false);
      }, {
        username: user.username,
      });
    } catch (error) {
      if (error?.graphQLErrors[0]?.message.message === 'followed') {
        await query(({ user: newUserInfo }) => {
          setUserInfo(newUserInfo);
          setFollowLoading(false);
        }, {
          username: user.username,
        });
      } else {
        setFollowLoading(false);
      }
    }
  }, 1000), [mutate, query, setUserInfo, user.id, user.isFollowing, user.username]);
  return (
    <UserHeader>
      <HeaderGrid columns="140px auto" gap="32px">
        <AvatarBox>
          <Avatar src={user.avatar} size={140} />
        </AvatarBox>
        <Cell>
          <UserName>
            <EmojiText
              text={user.fullName}
            />
            {
              isLogin && userInfo?.username === user.username && (
                <A route="/setting/profile">
                  <EditIcon size={18} />
                </A>
              )
            }
            {
              userInfo?.username !== user.username && (
                <FollowButton
                  disabled={followLoading}
                  style={{ marginLeft: rem(24), marginRight: rem(24) }}
                  size="small"
                  isFollowing={user.isFollowing}
                  onClick={follow}
                />
              )
            }
          </UserName>
          <Profile>
            {
              user.website && (
                <ProfileItem>
                  <ProfileItemLink href={user.website} target="__blank">
                    <LinkIcon size={14} />
                    {parse(user.website).hostname}
                  </ProfileItemLink>
                </ProfileItem>
              )
            }
          </Profile>
          <Bio>
            {user.bio}
          </Bio>
          <InfoBox>
            <Info>
              <InfoItem>
                <InfoItemCount>{user.followerCount}</InfoItemCount>
                <InfoItemLabel>{t('user.label.followers')}</InfoItemLabel>
              </InfoItem>
              <InfoItem>
                <InfoItemCount>{user.followedCount}</InfoItemCount>
                <InfoItemLabel>{t('user.label.followed')}</InfoItemLabel>
              </InfoItem>
              <InfoItem>
                <InfoItemCount>{user.likesCount}</InfoItemCount>
                <InfoItemLabel>{t('user.label.likes')}</InfoItemLabel>
              </InfoItem>
            </Info>
          </InfoBox>
        </Cell>
      </HeaderGrid>
    </UserHeader>
  );
});

const Picture = observer(() => {
  const { screen } = useStores();
  const { userPictureStore } = screen;
  const { type: PictureType, list } = userPictureStore;
  console.log(PictureType);
  return (
    <PictureList
      noMore={list[PictureType].isNoMore}
      data={list[PictureType].list}
      like={list[PictureType].like}
      onPage={list[PictureType].getPageList}
    />
  );
});

User.getInitialProps = async ({
  mobxStore, route,
}: ICustomNextContext) => {
  const { params } = route;
  const { username, type } = params as { username: string; type: UserType };
  const { appStore, screen } = mobxStore;
  const { userCollectionStore, userPictureStore, userStore } = screen;
  const { location } = appStore;
  const all = [];
  const arg: [string, UserType] = [username!, type];
  const isPop = location && location.action === 'POP' && !server;
  userCollectionStore.setUsername(username!);
  if (isPop) {
    all.push(userStore.getCache(username));
  } else {
    all.push(userStore.getInit(...arg));
  }
  switch (type!) {
    case UserType.collections:
      all.push(
        userCollectionStore.getList(false),
      );
      break;
    default:
      all.push(isPop ? userPictureStore.getCache(...arg) : userPictureStore.getList(...arg));
  }
  await Promise.all(all);
  return {
    type,
    username: params.username,
  };
};

export default withRouter(withError(pageWithTranslation([I18nNamespace.User, I18nNamespace.Collection])(User)));
