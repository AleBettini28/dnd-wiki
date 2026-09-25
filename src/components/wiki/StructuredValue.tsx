import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { parseApiResourceUrl } from '../../types/api';
import { wikiDetailPath } from '../../constants/routes';

const HIDDEN_KEYS = new Set(['index', 'url', 'updated_at', 'option_type', 'option_set_type']);

const ABILITY_KEYS = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
] as const;

type StructuredValueProps = {
  readonly value: unknown;
  readonly depth?: number;
};

function formatLabel(key: string): string {
  return key
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isResourceRef(
  value: unknown
): value is { name: string; url?: string; index?: string } {
  return isPlainObject(value) && typeof value.name === 'string';
}

function isNamedBlock(
  value: unknown
): value is { name: string; desc?: unknown; url?: string } {
  return (
    isResourceRef(value) &&
    ('desc' in value || 'attack_bonus' in value || 'damage' in value)
  );
}

function isChoiceBlock(
  value: unknown
): value is { choose: number; type?: string; from: unknown; desc?: string } {
  return (
    isPlainObject(value) &&
    typeof value.choose === 'number' &&
    'from' in value
  );
}

function isCost(
  value: unknown
): value is { quantity: number; unit: string } {
  return (
    isPlainObject(value) &&
    typeof value.quantity === 'number' &&
    typeof value.unit === 'string' &&
    Object.keys(value).every((key) => key === 'quantity' || key === 'unit')
  );
}

function omitKeys(
  data: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (!keys.includes(key)) {
      result[key] = value;
    }
  });
  return result;
}

function ResourceLink({ name, url }: { name: string; url?: string }) {
  if (!url) {
    return <span>{name}</span>;
  }

  const resource = parseApiResourceUrl(url);
  if (!resource) {
    return <span>{name}</span>;
  }

  return (
    <Link
      className="wiki-inline-link"
      to={wikiDetailPath(resource.category, resource.index)}
    >
      {name}
    </Link>
  );
}

function ApiPathValue({ path }: { path: string }) {
  const exact = path.match(/^\/api\/(?:2014\/)?([^/]+)\/([^/]+)$/);
  if (exact) {
    return (
      <Link className="wiki-inline-link" to={wikiDetailPath(exact[1], exact[2])}>
        {exact[2].replaceAll('-', ' ')}
      </Link>
    );
  }

  const nested = path.match(/^\/api\/(?:2014\/)?([^/]+)\/([^/]+)\//);
  if (nested) {
    return (
      <Link
        className="wiki-inline-link"
        to={wikiDetailPath(nested[1], nested[2])}
      >
        View {nested[2].replaceAll('-', ' ')}
      </Link>
    );
  }

  return <code className="structured__code">{path}</code>;
}

function DescriptionText({ text }: { text: string }) {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('# ')) {
    return <h3 className="structured__md-title">{trimmed.slice(2)}</h3>;
  }

  return <p className="structured__paragraph">{trimmed}</p>;
}

function renderStringList(items: string[]) {
  const looksLikeParagraphs = items.some(
    (item) => item.length > 80 || item.includes('. ')
  );

  if (looksLikeParagraphs) {
    return (
      <div className="structured__prose">
        {items.map((item, index) => (
          <DescriptionText key={index} text={item} />
        ))}
      </div>
    );
  }

  return (
    <ul className="structured__list">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function renderPrimitive(value: string | number | boolean) {
  if (typeof value === 'boolean') {
    return <span>{value ? 'Yes' : 'No'}</span>;
  }
  if (typeof value === 'string' && value.startsWith('/api/')) {
    return <ApiPathValue path={value} />;
  }
  return <span>{String(value)}</span>;
}

function AbilityScores({ data }: { data: Record<string, unknown> }) {
  const scores = ABILITY_KEYS.map((key) => ({
    key,
    label: key.slice(0, 3).toUpperCase(),
    value: data[key],
  })).filter((item) => typeof item.value === 'number');

  if (scores.length === 0) {
    return null;
  }

  return (
    <div className="structured__abilities">
      {scores.map((score) => (
        <div key={score.key} className="structured__ability">
          <span className="structured__ability-label">{score.label}</span>
          <span className="structured__ability-value">{String(score.value)}</span>
        </div>
      ))}
    </div>
  );
}

function NamedCard({
  item,
  depth,
}: {
  item: { name: string; desc?: unknown; url?: string } & Record<string, unknown>;
  depth: number;
}) {
  const rest = omitKeys(item, ['name', 'desc', 'url', 'index']);

  return (
    <article className="structured__card">
      <h3 className="structured__card-title">
        {item.url ? <ResourceLink name={item.name} url={item.url} /> : item.name}
      </h3>
      {item.desc !== undefined && (
        <StructuredValue value={item.desc} depth={depth + 1} />
      )}
      {Object.keys(rest).length > 0 && (
        <StructuredValue value={rest} depth={depth + 1} />
      )}
    </article>
  );
}

function ChoiceBlock({
  value,
  depth,
}: {
  value: { choose: number; type?: string; from: unknown; desc?: string };
  depth: number;
}) {
  return (
    <div className="structured__choice">
      {value.desc && <p className="structured__paragraph">{value.desc}</p>}
      <p className="structured__choice-meta">
        Choose {value.choose}
        {value.type ? ` (${value.type.replaceAll('_', ' ')})` : ''}
      </p>
      <StructuredValue value={value.from} depth={depth + 1} />
    </div>
  );
}

function StructuredObject({
  data,
  depth,
}: {
  data: Record<string, unknown>;
  depth: number;
}) {
  const HeadingTag = depth <= 1 ? 'h2' : depth === 2 ? 'h3' : 'h4';
  const abilityBlock = depth === 0 ? <AbilityScores data={data} /> : null;
  const abilityKeySet = new Set<string>(ABILITY_KEYS);

  const entries = Object.entries(data).filter(([key, value]) => {
    if (HIDDEN_KEYS.has(key)) {
      return false;
    }
    if (value === null || value === undefined) {
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }
    if (depth === 0 && abilityKeySet.has(key) && typeof value === 'number') {
      return false;
    }
    if (key === 'name' && depth === 0) {
      return false;
    }
    if (key === 'image' && depth === 0) {
      return false;
    }
    return true;
  });

  const longTextKeys = new Set(
    entries
      .filter(
        ([, value]) => typeof value === 'string' && value.length > 120
      )
      .map(([key]) => key)
  );

  const scalarEntries = entries.filter(([key, value]) => {
    if (longTextKeys.has(key)) {
      return false;
    }
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      isCost(value) ||
      (isResourceRef(value) && !isNamedBlock(value) && !isChoiceBlock(value))
    );
  });

  const blockEntries = entries.filter(([key]) => {
    return (
      !scalarEntries.some(([scalarKey]) => scalarKey === key) &&
      !longTextKeys.has(key)
    );
  });

  return (
    <div className={`structured__object structured__object--d${depth}`}>
      {abilityBlock}

      {scalarEntries.length > 0 && (
        <dl className="structured__facts">
          {scalarEntries.map(([key, value]) => {
            let content: ReactNode = null;

            if (isCost(value)) {
              content = (
                <span>
                  {value.quantity} {value.unit}
                </span>
              );
            } else if (isResourceRef(value)) {
              content = <ResourceLink name={value.name} url={value.url} />;
            } else if (
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean'
            ) {
              content = renderPrimitive(value);
            }

            return (
              <div key={key} className="structured__fact">
                <dt>{formatLabel(key)}</dt>
                <dd>{content}</dd>
              </div>
            );
          })}
        </dl>
      )}

      {[...longTextKeys].map((key) => {
        const value = data[key];
        if (typeof value !== 'string') {
          return null;
        }
        return (
          <section key={key} className="structured__section">
            <HeadingTag className="structured__heading">
              {formatLabel(key)}
            </HeadingTag>
            <div className="structured__prose">
              <DescriptionText text={value} />
            </div>
          </section>
        );
      })}

      {blockEntries.map(([key, value]) => (
        <section key={key} className="structured__section">
          <HeadingTag className="structured__heading">
            {formatLabel(key)}
          </HeadingTag>
          <StructuredValue value={value} depth={depth + 1} />
        </section>
      ))}
    </div>
  );
}

function StructuredValue({ value, depth = 0 }: Readonly<StructuredValueProps>) {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    if (typeof value === 'string') {
      if (value.startsWith('/api/')) {
        return renderPrimitive(value);
      }
      return (
        <div className="structured__prose">
          <DescriptionText text={value} />
        </div>
      );
    }
    return renderPrimitive(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }

    if (value.every((item) => typeof item === 'string')) {
      return renderStringList(value as string[]);
    }

    if (value.every((item) => isResourceRef(item) && !isNamedBlock(item))) {
      return (
        <ul className="structured__chips">
          {value.map((item, index) => {
            const ref = item as { name: string; url?: string; index?: string };
            return (
              <li key={ref.url || ref.index || `${ref.name}-${index}`}>
                <ResourceLink name={ref.name} url={ref.url} />
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <div className="structured__stack">
        {value.map((item, index) => {
          if (isNamedBlock(item)) {
            return <NamedCard key={item.url || `${item.name}-${index}`} item={item} depth={depth} />;
          }

          if (isChoiceBlock(item)) {
            return <ChoiceBlock key={index} value={item} depth={depth} />;
          }

          if (isPlainObject(item) && typeof item.string === 'string') {
            return (
              <article key={index} className="structured__card">
                <DescriptionText text={item.string} />
              </article>
            );
          }

          if (
            isPlainObject(item) &&
            typeof item.desc === 'string' &&
            !('name' in item)
          ) {
            const rest = omitKeys(item, ['desc', 'option_type']);
            return (
              <article key={index} className="structured__card">
                <DescriptionText text={item.desc} />
                {Object.keys(rest).length > 0 && (
                  <StructuredValue value={rest} depth={depth + 1} />
                )}
              </article>
            );
          }

          return (
            <div key={index} className="structured__stack-item">
              <StructuredValue value={item} depth={depth + 1} />
            </div>
          );
        })}
      </div>
    );
  }

  if (isChoiceBlock(value)) {
    return <ChoiceBlock value={value} depth={depth} />;
  }

  if (isCost(value)) {
    return (
      <span>
        {value.quantity} {value.unit}
      </span>
    );
  }

  if (isNamedBlock(value) && depth > 0) {
    return <NamedCard item={value} depth={depth} />;
  }

  if (isPlainObject(value)) {
    if ('options' in value && Array.isArray(value.options)) {
      return <StructuredValue value={value.options} depth={depth} />;
    }

    if (isPlainObject(value.item) && isResourceRef(value.item)) {
      const quantity =
        typeof value.quantity === 'number' ? ` x${value.quantity}` : '';
      return (
        <span>
          <ResourceLink name={value.item.name} url={value.item.url} />
          {quantity}
        </span>
      );
    }

    if (typeof value.string === 'string') {
      return <DescriptionText text={value.string} />;
    }

    return <StructuredObject data={value} depth={depth} />;
  }

  return <span>{String(value)}</span>;
}

export default StructuredValue;
