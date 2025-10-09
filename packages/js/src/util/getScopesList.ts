export enum NonPremiumScopes {
  openid = 'openid',
  wallet = 'wallet',
}

export enum BasicScopesEnum {
  email = 'email',
  badges = 'badges',
  offline = 'offline',
  offline_access = 'offline_access',
  humanity_check = 'humanity_check',
  profile = 'profile',
  social = 'social',
}

export enum SocialScopesEnum {
  twitter = 'social:twitter',
  reddit = 'social:reddit',
  youtube = 'social:youtube',
  discord = 'social:discord',
  telegram = 'social:telegram',
}

export enum ProfileScopesEnum {
  display_name = 'profile:name',
  profile_location = 'profile:location',
  profile_bio = 'profile:bio',
  ipfs_website = 'profile:ipfs_website',
  profile_picture = 'profile:picture',
  profile_uri = 'profile:uri',
  profile_phone = 'profile:phone',
}

export type PremiumScopes =
  | BasicScopesEnum
  | SocialScopesEnum
  | ProfileScopesEnum

export interface ScopeDefinition {
  optional: boolean
}

export const NON_PREMIUM_SCOPE_CONFIG: Record<
  NonPremiumScopes,
  ScopeDefinition
> = {
  [NonPremiumScopes.openid]: {
    optional: false,
  },
  [NonPremiumScopes.wallet]: {
    optional: false,
  },
}

export const SCOPE_CONFIG: Record<PremiumScopes, ScopeDefinition> = {
  [BasicScopesEnum.email]: {
    optional: true,
  },
  [BasicScopesEnum.offline]: {
    optional: false,
  },
  [BasicScopesEnum.offline_access]: {
    optional: false,
  },
  [BasicScopesEnum.humanity_check]: {
    optional: true,
  },
  [BasicScopesEnum.badges]: {
    optional: true,
  },
  [BasicScopesEnum.profile]: {
    optional: true,
  },
  [BasicScopesEnum.social]: {
    optional: true,
  },
  [ProfileScopesEnum.display_name]: {
    optional: true,
  },
  [ProfileScopesEnum.profile_location]: {
    optional: true,
  },
  [ProfileScopesEnum.profile_bio]: {
    optional: true,
  },
  [ProfileScopesEnum.profile_picture]: {
    optional: true,
  },
  [ProfileScopesEnum.profile_uri]: {
    optional: true,
  },
  [ProfileScopesEnum.profile_phone]: {
    optional: true,
  },
  [ProfileScopesEnum.ipfs_website]: {
    optional: true,
  },
  [SocialScopesEnum.twitter]: {
    optional: true,
  },
  [SocialScopesEnum.reddit]: {
    optional: true,
  },
  [SocialScopesEnum.youtube]: {
    optional: true,
  },
  [SocialScopesEnum.discord]: {
    optional: true,
  },
  [SocialScopesEnum.telegram]: {
    optional: true,
  },
} as const

export const getScopesList = ({premium}): string[] => {
  const scopes: string[] = []
  const SCOPES_LIST = premium ? SCOPE_CONFIG : NON_PREMIUM_SCOPE_CONFIG
  Object.keys(SCOPES_LIST).forEach(name => {
    scopes.push(name)
    if (SCOPES_LIST[name].optional) {
      scopes.push(`${name}:optional`)
    }
  })
  return scopes
}
