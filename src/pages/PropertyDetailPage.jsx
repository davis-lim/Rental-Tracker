import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then(setProperty)
      .catch(() => {});
  }, [id]);

  if (!property) return <p className="pt-8 text-muted-foreground">Loading...</p>;

  return (
    <div className="pt-8">
      <Link to="/properties" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to Properties
      </Link>
      <h2 className="text-xl font-semibold mt-4">{property.address}</h2>
      {property.notes && <p className="text-muted-foreground mt-1">{property.notes}</p>}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold">Tenants</h3>
      <p className="text-muted-foreground mt-2">
        Tenant management will be added in the next step.
      </p>
    </div>
  );
}
