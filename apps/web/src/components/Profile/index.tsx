import MetaTags from "@components/Common/MetaTags";
import NewPost from "@components/Composer/NewPost";
import Cover from "@components/Shared/Cover";
import { Leafwatch } from "@helpers/leafwatch";
import { NoSymbolIcon } from "@heroicons/react/24/outline";
import {
  APP_NAME,
  HANDLE_PREFIX,
  STATIC_IMAGES_URL
} from "@hey/data/constants";
import { AccountFeedType } from "@hey/data/enums";
import { FeatureFlag } from "@hey/data/feature-flags";
import { PAGEVIEW } from "@hey/data/tracking";
import getProfileDetails, {
  GET_PROFILE_DETAILS_QUERY_KEY
} from "@hey/helpers/api/getProfileDetails";
import getProfile from "@hey/helpers/getProfile";
import type { Profile } from "@hey/lens";
import { useProfileQuery } from "@hey/lens";
import { EmptyState, GridItemEight, GridItemFour, GridLayout } from "@hey/ui";
import { useQuery } from "@tanstack/react-query";
import { useFlag } from "@unleash/proxy-client-react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Custom404 from "src/pages/404";
import Custom500 from "src/pages/500";
import { useProfileStore } from "src/store/persisted/useProfileStore";
import AccountFeed from "./AccountFeed";
import Details from "./Details";
import FeedType from "./FeedType";
import Lists from "./Lists";
import AccountPageShimmer from "./Shimmer";
import SuspendedDetails from "./SuspendedDetails";

const ViewProfile: NextPage = () => {
  const {
    isReady,
    pathname,
    query: { handle, id, source, type }
  } = useRouter();
  const { currentProfile } = useProfileStore();
  const isStaff = useFlag(FeatureFlag.Staff);

  useEffect(() => {
    if (isReady) {
      Leafwatch.track(PAGEVIEW, {
        page: "profile",
        subpage: pathname
          .replace("/u/[handle]", "")
          .replace("/profile/[id]", ""),
        ...(source ? { source } : {})
      });
    }
  }, [handle, id]);

  const lowerCaseAccountFeedType = [
    AccountFeedType.Feed.toLowerCase(),
    AccountFeedType.Replies.toLowerCase(),
    AccountFeedType.Media.toLowerCase(),
    AccountFeedType.Collects.toLowerCase(),
    AccountFeedType.Lists.toLowerCase()
  ];

  const feedType = type
    ? lowerCaseAccountFeedType.includes(type as string)
      ? type.toString().toUpperCase()
      : AccountFeedType.Feed
    : AccountFeedType.Feed;

  const {
    data,
    error,
    loading: profileLoading
  } = useProfileQuery({
    skip: id ? !id : !handle,
    variables: {
      request: {
        ...(id
          ? { forProfileId: id }
          : { forHandle: `${HANDLE_PREFIX}${handle}` })
      }
    }
  });

  const profile = data?.profile as Profile;

  const { data: profileDetails, isLoading: profileDetailsLoading } = useQuery({
    enabled: Boolean(profile?.id),
    queryFn: () => getProfileDetails(profile?.id),
    queryKey: [GET_PROFILE_DETAILS_QUERY_KEY, profile?.id]
  });

  if (!isReady || profileLoading) {
    return <AccountPageShimmer />;
  }

  if (!data?.profile) {
    return <Custom404 />;
  }

  if (error) {
    return <Custom500 />;
  }

  const isSuspended = isStaff ? false : profileDetails?.isSuspended;

  return (
    <>
      <MetaTags
        creator={getProfile(profile).displayName}
        description={profile.metadata?.bio}
        title={`${getProfile(profile).displayName} (${
          getProfile(profile).slugWithPrefix
        }) • ${APP_NAME}`}
      />
      <Cover
        cover={
          isSuspended
            ? `${STATIC_IMAGES_URL}/patterns/2.svg`
            : profile?.metadata?.coverPicture?.optimized?.uri ||
              `${STATIC_IMAGES_URL}/patterns/2.svg`
        }
      />
      <GridLayout>
        <GridItemFour>
          {isSuspended ? (
            <SuspendedDetails profile={profile as Profile} />
          ) : (
            <Details
              isSuspended={profileDetails?.isSuspended || false}
              profile={profile as Profile}
            />
          )}
        </GridItemFour>
        <GridItemEight className="space-y-5">
          {isSuspended ? (
            <EmptyState
              icon={<NoSymbolIcon className="size-8" />}
              message="Profile Suspended"
            />
          ) : (
            <>
              <FeedType feedType={feedType as AccountFeedType} />
              {currentProfile?.id === profile?.id &&
              feedType !== AccountFeedType.Lists ? (
                <NewPost />
              ) : null}
              {feedType === AccountFeedType.Feed ||
              feedType === AccountFeedType.Replies ||
              feedType === AccountFeedType.Media ||
              feedType === AccountFeedType.Collects ? (
                <AccountFeed
                  handle={getProfile(profile).slugWithPrefix}
                  profileDetailsLoading={profileDetailsLoading}
                  profileId={profile.id}
                  type={feedType}
                />
              ) : feedType === AccountFeedType.Lists ? (
                <Lists profile={profile} />
              ) : null}
            </>
          )}
        </GridItemEight>
      </GridLayout>
    </>
  );
};

export default ViewProfile;
