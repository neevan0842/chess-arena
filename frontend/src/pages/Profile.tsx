import { useState } from "react";
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
import { Input } from "@/components/ui/input";

const ProfilePage = () => {
  const [username, setUsername] = useState("ChessMaster123");

  const stats = {
    totalGames: 50,
    wins: 30,
    losses: 18,
    winRate: "60%",
    mostPlayedColor: "White",
    bestStreak: "5 Wins",
  };

  const games = [
    {
      opponent: "Player123",
      result: "Win",
      type: "Multiplayer",
      date: "2d ago",
    },
    { opponent: "AI (Hard)", result: "Loss", type: "AI", date: "5d ago" },
    {
      opponent: "PlayerXYZ",
      result: "Draw",
      type: "Multiplayer",
      date: "1w ago",
    },
  ];

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
          <h2 className="text-xl font-bold">{username}</h2>
          <p className="text-gray-500">Joined on: Jan 1, 2024</p>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="games">Recent Games</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card className="p-4">
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>
                <strong>Total Games:</strong> {stats.totalGames}
              </p>
              <p>
                <strong>Wins:</strong> {stats.wins}
              </p>
              <p>
                <strong>Losses:</strong> {stats.losses}
              </p>
              <p>
                <strong>Win Rate:</strong> {stats.winRate}
              </p>
              <p>
                <strong>Most Played Color:</strong> {stats.mostPlayedColor}
              </p>
              <p>
                <strong>Best Streak:</strong> {stats.bestStreak}
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
                {games.map((game, index) => (
                  <TableRow key={index}>
                    <TableCell>{game.opponent}</TableCell>
                    <TableCell>{game.result}</TableCell>
                    <TableCell>{game.type}</TableCell>
                    <TableCell>{game.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="p-4 space-y-4">
            <div>
              <label className="text-sm font-semibold">Change Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full"
              />
            </div>
            <Button className="w-full sm:w-auto">Save Changes</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
