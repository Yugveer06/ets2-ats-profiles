import { showToast, Toast } from "@raycast/api";
import fs from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { decryptSii, hexToString } from "./siiService";

export enum Game {
  ATS = "American Truck Simulator",
  ETS2 = "Euro Truck Simulator 2",
}

export type Profile = {
  name: string;
  hexName: string;
  path: string;
};

export async function getProfiles(game: Game) {
  const profiles: Profile[] = [];
  const home = homedir();
  const profilesPath = path.join(home, "Documents", game, "profiles");

  if (!fs.existsSync(profilesPath)) {
    showToast({
      title: "Profiles not found",
      message: `No profiles found for ${game}.`,
      style: Toast.Style.Failure,
    });
  }

  const files = fs.readdirSync(profilesPath);
  for (const file of files) {
    const filePath = path.join(profilesPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      const name = hexToString(file);
      if (name) {
        const profileDataPath = path.join(filePath, "profile.sii");
        await decryptSii(profileDataPath);
        profiles.push({ name, hexName: file, path: filePath });
      }
    }
  }

  return profiles;
}
