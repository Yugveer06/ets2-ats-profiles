import { Action, ActionPanel, Clipboard, Keyboard, List } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { Game, getProfiles, Profile } from "../services/profileService";
import { parseSiiFile } from "sii-parse-ts";
import path from "node:path";

export default function ProfileViewer({ game }: { game: Game }) {
  const { data: profiles, isLoading } = usePromise(
    async () => {
      return await getProfiles(game);
    },
    [],
    { execute: true },
  );

  async function handleParseSii(profile: Profile) {
    const parsedSii = await parseSiiFile(path.join(profile.path, "profile.sii"));
    await Clipboard.copy(JSON.stringify(parsedSii));
  }

  return (
    <List isShowingDetail isLoading={isLoading}>
      {profiles?.map((profile) => (
        <List.Item
          key={profile.hexName}
          title={profile.name}
          actions={
            <ActionPanel>
              <Action
                title="Parse Sii"
                shortcut={{ modifiers: ["ctrl"], key: "p" }}
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
              markdown={`${profile.name}`}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Name" text={profile.name} />
                  <List.Item.Detail.Metadata.Label title="Hex Name" text={profile.hexName} />
                  <List.Item.Detail.Metadata.Label title="Path" text={profile.path} />
                </List.Item.Detail.Metadata>
              }
            />
          }
        />
      ))}
    </List>
  );
}
