import RFQForm from '../components/RFQForm';
import PageHeader from '../../../components/common/PageHeader';

const CreateRFQ = () => {

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Create Request For Quotation"
        description="Draft a new Request for Quotation."
        backHref="/app/rfqs"
      />
      <RFQForm mode="create" />
    </div>
  );
};

export default CreateRFQ;
