import { imageUrl } from '../../api/dndApi';
import type { ApiResult } from '../../types/api';
import StructuredValue from './StructuredValue';

type ResourceDetailProps = {
  readonly data: ApiResult;
};

function ResourceDetail({ data }: Readonly<ResourceDetailProps>) {
  const img = imageUrl(
    typeof data.image === 'string' ? data.image : undefined
  );

  return (
    <article className="resource-detail">
      <header className="resource-detail__header">
        <h1>{data.name}</h1>
      </header>

      {img && (
        <img className="resource-detail__image" src={img} alt={data.name} />
      )}

      <StructuredValue value={data} depth={0} />
    </article>
  );
}

export default ResourceDetail;
