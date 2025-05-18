import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailCampaigns } from "./EmailCampaigns";
import { EmailTemplates } from "./EmailTemplates";
import { EmailAnalytics } from "./EmailAnalytics";
import { EmailSubscribers } from "./EmailSubscribers";

export function EmailDashboard() {
  return (
    <Tabs defaultValue="campaigns" className="space-y-4">
      <TabsList>
        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="campaigns" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Email Campaigns</CardTitle>
            <CardDescription>
              Create and manage email campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailCampaigns />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="templates" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>
              Manage and create email templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailTemplates />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscribers" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Subscribers</CardTitle>
            <CardDescription>
              Manage email subscribers and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailSubscribers />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Email Analytics</CardTitle>
            <CardDescription>
              View email campaign performance and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailAnalytics />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 