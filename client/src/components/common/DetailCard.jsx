import React from 'react';
import { Card, CardHeader, CardBody } from './Card';

const DetailCard = ({ title, action, children, className = '' }) => {
  return (
    <Card className={`hover:shadow-md transition-shadow duration-300 ${className}`}>
      {title && <CardHeader title={title} action={action} />}
      <CardBody className="p-5 md:p-6">
        {children}
      </CardBody>
    </Card>
  );
};

export default DetailCard;
