"use client";

import { useEffect, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  AdminTable,
  FormGrid,
  FormItem,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  type MenuItem,
  useSiteMenus,
  useUpdateSiteMenus,
} from "@/services/configuration-api-hooks";

function MenuTable({
  title,
  items,
  onChange,
}: {
  title: string;
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
}) {
  const rows = items.map((item, index) => [
    <strong key="l">{item.label}</strong>,
    <code key="u" style={{ fontSize: ".74rem" }}>
      {item.href}
    </code>,
    <div key="a" className="btn-row">
      <AdminButton
        onClick={() => {
          if (index === 0) return;
          const next = [...items];
          [next[index - 1], next[index]] = [next[index], next[index - 1]];
          onChange(next);
        }}
      >
        ↑
      </AdminButton>
      <AdminButton
        onClick={() => {
          if (index >= items.length - 1) return;
          const next = [...items];
          [next[index], next[index + 1]] = [next[index + 1], next[index]];
          onChange(next);
        }}
      >
        ↓
      </AdminButton>
      <AdminButton
        variant="danger"
        onClick={() => onChange(items.filter((_, i) => i !== index))}
      >
        Delete
      </AdminButton>
    </div>,
  ]);

  return (
    <AdminPanel title={title} bodyClassName="panel-bd">
      <AdminTable headers={["Label", "URL", "Actions"]} rows={rows} emptyMessage="No menu items" />
    </AdminPanel>
  );
}

export function MenuMgmtPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const menusQuery = useSiteMenus();
  const updateMenus = useUpdateSiteMenus();

  const [header, setHeader] = useState<MenuItem[]>([]);
  const [footer, setFooter] = useState<MenuItem[]>([]);
  const [which, setWhich] = useState<"header" | "footer">("header");
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");

  useEffect(() => {
    if (!menusQuery.data) return;
    setHeader(menusQuery.data.header);
    setFooter(menusQuery.data.footer);
  }, [menusQuery.data]);

  const persist = (nextHeader: MenuItem[], nextFooter: MenuItem[]) => {
    updateMenus.mutate(
      { header: nextHeader, footer: nextFooter },
      {
        onSuccess: () => showToast("✅ Menu updated"),
        onError: () => showToast("⚠️ Failed to update menu"),
      },
    );
  };

  const handleHeaderChange = (items: MenuItem[]) => {
    setHeader(items);
    persist(items, footer);
  };

  const handleFooterChange = (items: MenuItem[]) => {
    setFooter(items);
    persist(header, items);
  };

  const handleAdd = () => {
    const l = label.trim();
    const u = href.trim();
    if (!l || !u) {
      showToast("⚠️ Label and URL required");
      return;
    }
    if (which === "header") {
      const next = [...header, { label: l, href: u }];
      setHeader(next);
      persist(next, footer);
    } else {
      const next = [...footer, { label: l, href: u }];
      setFooter(next);
      persist(header, next);
    }
    setLabel("");
    setHref("");
    showToast("✅ Menu item added");
  };

  return (
    <>
      <MenuTable title="🧭 Header Menu" items={header} onChange={handleHeaderChange} />
      <MenuTable title="🦶 Footer Menu" items={footer} onChange={handleFooterChange} />
      <AdminPanel
        title="➕ Add Menu Item"
        actions={
          <AdminButton variant="primary" onClick={handleAdd}>
            Add Item
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <FormGrid>
          <FormItem label="Menu">
            <select value={which} onChange={(e) => setWhich(e.target.value as "header" | "footer")}>
              <option value="header">Header Menu</option>
              <option value="footer">Footer Menu</option>
            </select>
          </FormItem>
          <FormItem label="Label">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Careers" />
          </FormItem>
          <FormItem label="URL" full>
            <input value={href} onChange={(e) => setHref(e.target.value)} placeholder="/careers" />
          </FormItem>
        </FormGrid>
      </AdminPanel>
    </>
  );
}
