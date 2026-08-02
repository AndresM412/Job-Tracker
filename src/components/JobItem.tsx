import { type JobApplication } from "../types/job";
import Card from "./Card";
import StatusBadge from "./StatusBadge";

type JobItemProps = {
  job: JobApplication;
  onDeleteJob: (id: string) => void;
  onEditJob: (job: JobApplication) => void;
};

function JobItem({ job, onDeleteJob , onEditJob }: JobItemProps) {
  return (
    <Card>
      <h2>{job.company}</h2>
      <p>{job.position}</p>
      <StatusBadge status={job.status} />
      <p>{job.applicationDate}</p> 
      <button onClick={() => onEditJob(job)}>Edit</button>
      <button onClick={() => onDeleteJob(job.id)}>Delete</button>
    </Card>
  );
}

export default JobItem;
