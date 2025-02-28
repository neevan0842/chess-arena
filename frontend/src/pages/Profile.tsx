import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router";
import {
  deleteUser,
  getRecentGames,
  getUserData,
  getUserStats,
  RecentGameInterface,
  UserStatsInterface,
} from "@/api/userApi";
import { UserInterface } from "@/api/authApi";
import { formatJoinDate } from "@/utils/utilities";
import useAuthStore from "@/store/useAuthStore";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { username } = useParams();
  const { user, resetAuth } = useAuthStore();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserInterface | null>(null);
  const [userStats, setUserStats] = useState<UserStatsInterface | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGameInterface[] | null>(
    null
  );

  const handleUserRedirect = (game: RecentGameInterface) => {
    if (!game) return;
    if (game.game_type === "ai") return;
    navigate(`/profile/${game.opponentUsername}`);
  };

  const handleDeleteAccount = async () => {
    const response = await deleteUser();
    if (response) {
      resetAuth();
      toast.success("Account deleted successfully");
      navigate("/");
    } else {
      toast.error("Failed to delete account");
    }
  };

  useEffect(() => {
    const getUserProfileDetails = async () => {
      if (!username) {
        navigate("/not-found");
      }
      const data = await getUserData(username!);
      if (!data) {
        navigate("/not-found");
      }
      const stats = await getUserStats(username!);
      const games = await getRecentGames(username!);
      setUserData(data);
      setUserStats(stats);
      setRecentGames(games);
    };
    getUserProfileDetails();
  }, [username, navigate]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="p-6 flex flex-wrap items-center gap-4">
        <Avatar className="w-16 h-16 rounded-full border-2 border-gray-200 shadow-md bg-white flex items-center justify-center overflow-hidden">
          <AvatarImage
            src="/profile.png"
            alt="User Avatar"
            className="object-cover w-full h-full"
          />
        </Avatar>

        <div>
          <h2 className="text-xl font-bold">
            {userData?.username ?? "username"}
          </h2>
          <p className="text-gray-500">
            {`Joined on: ${formatJoinDate(userData?.created_at)}`}
          </p>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="games">Recent Games</TabsTrigger>
          {user?.username === username && (
            <TabsTrigger value="settings">Settings</TabsTrigger>
          )}
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card className="p-4">
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>
                <strong>Total Games : </strong> {userStats?.totalGames}
              </p>
              <p>
                <strong>Multiplayer Wins : </strong>
                {userStats?.multiplayerWins}
              </p>
              <p>
                <strong>Multiplayer Losses : </strong>
                {userStats?.multiplayerLosses}
              </p>
              <p>
                <strong>Multiplayer Win Rate : </strong>
                {userStats?.multiplayerWinRate}
              </p>
              <p>
                <strong>Most Played Color : </strong>
                {userStats?.mostPlayedColor ?? "N/A"}
              </p>
              <p>
                <strong>Best Streak : </strong> {userStats?.bestStreak}
              </p>
              <p>
                <strong>AI Games : </strong> {userStats?.aiGames}
              </p>
              <p>
                <strong>AI Wins : </strong> {userStats?.aiWins}
              </p>
              <p>
                <strong>AI Losses : </strong> {userStats?.aiLosses}
              </p>
              <p>
                <strong>AI Win Rate : </strong> {userStats?.aiWinRate}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Games Tab */}
        <TabsContent value="games">
          <Card className="p-4 overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGames && recentGames.length > 0 ? (
                  recentGames.map((game, index) => (
                    <TableRow key={index}>
                      <TableCell
                        onClick={() => handleUserRedirect(game)}
                        className="cursor-pointer"
                      >
                        <strong>{game.opponentUsername}</strong>
                      </TableCell>
                      <TableCell>{game.result}</TableCell>
                      <TableCell>{game.game_type}</TableCell>
                      <TableCell>{`${formatJoinDate(
                        new Date(game.date)
                      )}`}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No games played yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        {user?.username === username && (
          <TabsContent value="settings">
            <Card className="p-4 space-y-4">
              <Button
                onClick={handleDeleteAccount}
                className="w-full sm:w-auto bg-red-600"
              >
                Delete Account
              </Button>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ProfilePage;
