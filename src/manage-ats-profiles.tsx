import ProfileViewer from "./components/profile-viewer";
import { Game } from "./services/profileService";

export default async function Command() {
  return <ProfileViewer game={Game.ATS} />;
}
