import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  "/": "Início",
  "/admin": "Formulários",
  "/auth": "Autenticação",
  "/share": "Compartilhar",
  "/admin/forms": "Formulários",
  "/questions": "Perguntas",
  "/form": "Formulário",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  // Don't show breadcrumbs on home page
  if (pathname === "/") {
    return null;
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbItems: BreadcrumbItemType[] = [
    { label: "Início", href: "/" },
  ];

  // Handle special routes
  if (pathname.startsWith("/admin/forms/") && pathname.includes("/questions")) {
    breadcrumbItems.push(
      { label: "Formulários", href: "/admin" },
      { label: "Gerenciar Perguntas", href: undefined }
    );
  } else if (pathname.startsWith("/admin/forms/") && pathname.includes("/responses")) {
    breadcrumbItems.push(
      { label: "Formulários", href: "/admin" },
      { label: "Respostas", href: undefined }
    );
  } else {
    // Regular breadcrumb generation
    pathSegments.forEach((segment, index) => {
      const path = "/" + pathSegments.slice(0, index + 1).join("/");
      // Skip duplicate "Formulários" for /admin/forms routes
      if (path === "/admin/forms" && routeLabels["/admin"] === routeLabels[path]) {
        return;
      }
      breadcrumbItems.push({
        label: routeLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: index < pathSegments.length - 1 ? path : undefined,
      });
    });
  }

  return (
    <div className="border-b border-border bg-background">
      <div className="w-[80vw] max-w-7xl mx-auto px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}

