import { getCampaignSubmissionsByFormId } from "@/lib/actions/campaign.actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Props = {
  params: Promise<{ id: string }>;
};

const CampaignSubmissionsPage = async ({ params }: Props) => {
  const { id } = await params;

  const submissions = await getCampaignSubmissionsByFormId(id);

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold mb-4">Campaign Submissions</h3>

      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800 scrollbar-hide">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">Submission ID</TableHead>
              <TableHead className="text-white">Submitted At</TableHead>
              <TableHead className="text-white">Answers</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {submissions.map((sub, idx) => (
              <TableRow
                key={sub._id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 border-b-0"
              >
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="font-medium">{sub._id.toString()}</TableCell>
                <TableCell>
                  {new Date(sub.submittedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {Object.entries(sub.answers).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-semibold">{key}:</span> {String(value)}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CampaignSubmissionsPage;
