import { Action, ActionPanel, Clipboard, Icon, Keyboard, List, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import path from "node:path";
import { parseSiiFileAuto, parseSiiFileStreaming, ProfileSii } from "sii-parse-ts";
import { Game, getProfiles, Profile } from "../services/profileService";

interface ProfileWithData extends Profile {
  parsedData?: ProfileSii;
}

export default function ProfileViewer({ game }: { game: Game }) {
  const { data: profiles, isLoading } = usePromise(
    async () => {
      const profs = await getProfiles(game);
      const profilesWithData: ProfileWithData[] = await Promise.all(
        profs.map(async (prof) => {
          try {
            const parsedSii = await parseSiiFileStreaming<ProfileSii>(path.join(prof.path, "profile.sii"));
            return { ...prof, parsedData: parsedSii };
          } catch (error) {
            return prof;
          }
        }),
      );
      return profilesWithData;
    },
    [],
    { execute: true },
  );

  async function handleParseSii(profile: Profile) {
    showToast({ title: "Parsing", style: Toast.Style.Animated });
    const parsedSii = await parseSiiFileAuto(path.join(profile.path, "profile.sii"));
    showToast({ title: "Copying to clipboard", style: Toast.Style.Animated });
    await Clipboard.copy(JSON.stringify(parsedSii));
    showToast({ title: "Copied to Clipboard", style: Toast.Style.Success });
  }

  function formatDistance(km: number): string {
    return `${km.toLocaleString()} km`;
  }

  function formatExperience(xp: number): string {
    return xp.toLocaleString();
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  return (
    <List isShowingDetail isLoading={isLoading}>
      {profiles?.map((profile) => {
        const parsedData = profile.parsedData?.SiiNunit?.user_profile?.[0];

        return (
          <List.Item
            key={profile.hexName}
            title={profile.name}
            actions={
              <ActionPanel>
                <Action.ShowInFinder path={profile.path} />
                <Action
                  title="Copy Parsed JSON"
                  icon={Icon.Clipboard}
                  shortcut={{ modifiers: ["ctrl", "shift"], key: "c" }}
                  onAction={() => handleParseSii(profile)}
                />
                <Action.CopyToClipboard
                  title="Copy Name"
                  content={profile.name}
                  shortcut={Keyboard.Shortcut.Common.CopyName}
                />
                <Action.CopyToClipboard
                  title="Copy Path"
                  content={profile.path}
                  shortcut={Keyboard.Shortcut.Common.CopyPath}
                />
              </ActionPanel>
            }
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Profile Name" text={profile.name} icon={Icon.Person} />
                    <List.Item.Detail.Metadata.Label title="Hex Name" text={profile.hexName} />
                    <List.Item.Detail.Metadata.Separator />
                    {parsedData && (
                      <>
                        <List.Item.Detail.Metadata.Label
                          title="Company"
                          text={parsedData.company_name || "N/A"}
                          icon={Icon.Building}
                        />
                        <List.Item.Detail.Metadata.Label
                          title="Gender"
                          text={parsedData.male ? "Male" : "Female"}
                          icon={Icon.Person}
                        />
                        <List.Item.Detail.Metadata.Label
                          title="Face ID"
                          text={parsedData.face?.toString() || "N/A"}
                          icon={Icon.Eye}
                        />
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label
                          title="Experience"
                          text={formatExperience(parsedData.cached_experience || 0)}
                          icon={Icon.Star}
                        />
                        <List.Item.Detail.Metadata.Label
                          title="Distance Traveled"
                          text={formatDistance(parsedData.cached_distance || 0)}
                          icon={Icon.Gauge}
                        />
                        <List.Item.Detail.Metadata.Label
                          title="Customization Points"
                          text={(parsedData.customization || 0).toLocaleString()}
                          icon={Icon.Brush}
                        />
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label
                          title="Current Truck"
                          text={parsedData.brand?.replace(/_/g, " ").toUpperCase() || "N/A"}
                          icon={Icon.Car}
                        />
                        <List.Item.Detail.Metadata.Label
                          title="Logo"
                          text={parsedData.logo || "N/A"}
                          icon={Icon.Image}
                        />
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label
                          title="Map"
                          text={parsedData.map_path || "N/A"}
                          icon={Icon.Map}
                        />
                        <List.Item.Detail.Metadata.Label
                          title="Active Mods"
                          text={parsedData.active_mods?.toString() || "0"}
                          icon={Icon.Plug}
                        />
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label
                          title="Created"
                          text={formatDate(parsedData.creation_time || 0)}
                          icon={Icon.Calendar}
                        />
                        <List.Item.Detail.Metadata.Label
                          title="Last Saved"
                          text={formatDate(parsedData.save_time || 0)}
                          icon={Icon.Clock}
                        />
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label
                          title="Profile Version"
                          text={parsedData.version?.toString() || "N/A"}
                          icon={Icon.Info}
                        />
                        <List.Item.Detail.Metadata.Label
                          title="Online Username"
                          text={parsedData.online_user_name || "Not set"}
                          icon={Icon.Globe}
                        />
                        <List.Item.Detail.Metadata.Separator />
                      </>
                    )}
                    <List.Item.Detail.Metadata.Label title="Path" text={profile.path} icon={Icon.Folder} />
                  </List.Item.Detail.Metadata>
                }
              />
            }
          />
        );
      })}
    </List>
  );
}
