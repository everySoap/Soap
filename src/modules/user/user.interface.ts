export interface IGithubUserInfo {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: string;
  blog: string;
  location: string;
  email: string;
  hireable: null;
  bio: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface IGoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

export interface IWeiboUserInfo {
  id: number;
  idstr: string;
  class: number;
  screen_name: string;
  name: string;
  province: string;
  city: string;
  location: string;
  description: string;
  url: string;
  profile_image_url: string;
  cover_image_phone: string;
  profile_url: string;
  domain: string;
  weihao: string;
  gender: string;
  followers_count: number;
  friends_count: number;
  pagefriends_count: number;
  statuses_count: number;
  video_status_count: number;
  favourites_count: number;
  created_at: string;
  following: boolean;
  allow_all_act_msg: boolean;
  geo_enabled: boolean;
  verified: boolean;
  verified_type: number;
  remark: string;
  insecurity: { sexual_content: boolean };
  status: {
    visible: {
      type: number;
      list_id: number;
    };
    created_at: string;
    id: number;
    idstr: string;
    mid: string;
    can_edit: boolean;
    show_additional_indication: number;
    text: string;
    source_allowclick: number;
    source_type: number;
    source: string;
    favorited: boolean;
    truncated: boolean;
    in_reply_to_status_id: string;
    in_reply_to_user_id: string;
    in_reply_to_screen_name: string;
    pic_urls: any[];
    geo: null;
    is_paid: boolean;
    mblog_vip_type: number;
    annotations: [[Record<string, any>]];
    reposts_count: number;
    comments_count: number;
    attitudes_count: number;
    pending_approval_count: number;
    isLongText: boolean;
    reward_exhibition_type: number;
    hide_flag: number;
    mlevel: number;
    biz_feature: number;
    hasActionTypeCard: number;
    darwin_tags: any[];
    hot_weibo_tags: any[];
    text_tag_tips: any[];
    mblogtype: number;
    rid: '0';
    userType: number;
    more_info_type: number;
    positive_recom_flag: number;
    content_auth: number;
    gif_ids: string;
    is_show_bulletin: 2;
    comment_manage_info: {
      comment_permission_type: -1;
      approval_comment_type: 0;
    };
    pic_num: number;
  };
  ptype: number;
  allow_all_comment: boolean;
  avatar_large: string;
  avatar_hd: string;
  verified_reason: string;
  verified_trade: string;
  verified_reason_url: string;
  verified_source: string;
  verified_source_url: string;
  verified_state: number;
  verified_level: number;
  verified_type_ext: number;
  has_service_tel: boolean;
  verified_reason_modified: string;
  verified_contact_name: string;
  verified_contact_email: string;
  verified_contact_mobile: string;
  follow_me: boolean;
  like: boolean;
  like_me: boolean;
  online_status: number;
  bi_followers_count: number;
  lang: string;
  star: number;
  mbtype: number;
  mbrank: number;
  block_word: number;
  block_app: number;
  ability_tags: string;
  credit_score: number;
  user_ability: number;
  urank: number;
  story_read_state: number;
  vclub_member: number;
  is_teenager: number;
  is_guardian: number;
  is_teenager_list: number;
}

export type IOauthUserInfo = IWeiboUserInfo | IGithubUserInfo | IGoogleUserInfo;
