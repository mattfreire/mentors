export function getProfilePicture(profilePicture, fullName) {
  return profilePicture ? profilePicture : `https://avatars.dicebear.com/api/initials/${fullName}.svg`
}
