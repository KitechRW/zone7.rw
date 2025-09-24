interface AvatarProps {
  userName: string;
}

const Avatar: React.FC<AvatarProps> = ({ userName }) => {
  // Generate a color based on username
  const colors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-pink-600",
  ];
  const colorIndex = userName.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white`}
    >
      <p>{userName.charAt(0).toUpperCase()}</p>
    </div>
  );
};

export default Avatar;
