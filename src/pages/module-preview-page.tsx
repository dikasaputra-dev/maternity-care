import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';

import { Badge, Card } from '@/components/ui/surface';
import { PermissionGate } from '@/features/auth/components/permission-gate';
import type { Permission } from '@/features/auth/constants/permissions';

interface ModulePreviewPageProps {
  title: string;
  description: string;
  requiredPermission: Permission;
  actionPermission?: Permission;
  actionDescription?: string;
}

export function ModulePreviewPage({
  actionDescription,
  actionPermission,
  description,
  requiredPermission,
  title,
}: ModulePreviewPageProps) {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-brand-600">RBAC Protected Module</p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </section>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Route berhasil diakses</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              User memiliki permission yang diperlukan untuk membuka halaman ini.
            </p>
          </div>

          <Badge tone="success">{requiredPermission}</Badge>
        </div>
      </Card>

      {actionPermission && actionDescription ? (
        <PermissionGate permission={actionPermission}>
          <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
            <CheckCircleOutlineIcon
              aria-hidden="true"
              className="mt-0.5 text-brand-600"
              fontSize="small"
            />

            <div>
              <p className="text-sm font-semibold text-slate-800">Action permission tersedia</p>

              <p className="mt-1 text-sm leading-6 text-slate-600">{actionDescription}</p>

              <p className="mt-2 text-xs font-medium text-brand-700">{actionPermission}</p>
            </div>
          </div>
        </PermissionGate>
      ) : null}
    </div>
  );
}
