import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Account Profile | Cherrybrush",
  description: "Manage your personal profile and view order history.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
