export default interface AddUserRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePicture: File | null;
}
