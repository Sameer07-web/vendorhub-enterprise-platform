import React from 'react';
import { Card, CardBody, CardHeader } from '../../../components/common/Card';

const ChartCard = ({ title, children, action }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <CardHeader title={title} action={action} />
      <CardBody className="p-5 flex-1 flex flex-col">
        {children}
      </CardBody>
    </Card>
  );
};

export default ChartCard;
