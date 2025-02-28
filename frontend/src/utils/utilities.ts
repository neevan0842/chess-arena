export const formatJoinDate = (date: Date | undefined): string => {
  if (!date) return "";
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return `${date.toLocaleDateString("en-US", options)}`;
};
