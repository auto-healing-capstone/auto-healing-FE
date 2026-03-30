import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Incident } from "../../../entities/incident/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../shared/ui/pagination";
import { Input } from "../../../shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import { EmptyState, InlineError, LoadingTableBlock } from "../../../shared/ui/state-blocks";
import { StatusBadge } from "../../../shared/ui/status-badge";

interface IncidentTableProps {
  incidents: Incident[];
  isLoading: boolean;
  errorMessage: string | null;
  onSelectIncident?: (incident: Incident) => void;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function IncidentTable({
  incidents,
  isLoading,
  errorMessage,
  onSelectIncident,
}: IncidentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const query = searchQuery.trim().toLowerCase();
      const searchable = `${incident.alert_name} ${incident.instance ?? ""} ${incident.summary ?? ""} ${incident.description ?? ""}`.toLowerCase();
      const queryMatch = query.length === 0 || searchable.includes(query);
      const severityMatch = severityFilter === "all" || incident.severity === severityFilter;
      const statusMatch = statusFilter === "all" || incident.status === statusFilter;

      return queryMatch && severityMatch && statusMatch;
    });
  }, [incidents, searchQuery, severityFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, severityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / pageSize));
  const pagedIncidents = filteredIncidents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const severityOptions = Array.from(new Set(incidents.map((incident) => incident.severity)));
  const statusOptions = Array.from(new Set(incidents.map((incident) => incident.status)));

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="border-b border-white/50 p-6">
        <h3 className="text-lg font-semibold text-slate-900">Recent Incidents</h3>
        <p className="mt-1 text-sm text-slate-600">
          Data source: FastAPI `GET /api/v1/incidents`
        </p>
        {!isLoading ? (
          <div className="mt-4 grid gap-3 xl:grid-cols-[1.5fr_0.75fr_0.75fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search alert, target, summary, or description"
                className="h-10 rounded-xl border-white/70 bg-white/70 pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-10 rounded-xl border-white/70 bg-white/70">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severity</SelectItem>
                {severityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-xl border-white/70 bg-white/70">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingTableBlock />
      ) : filteredIncidents.length === 0 ? (
        <EmptyState title="No incidents available" description="When alerts are ingested, they will appear here." />
      ) : (
        <div className="overflow-x-auto">
          {errorMessage ? (
            <div className="px-6 py-4">
              <InlineError message={errorMessage} />
            </div>
          ) : null}
          <table className="min-w-full text-left">
            <thead className="bg-white/45 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Alert</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Instance</th>
                <th className="px-6 py-4 font-medium">Summary</th>
                <th className="px-6 py-4 font-medium">Started At</th>
              </tr>
            </thead>
            <tbody>
              {pagedIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  className={`border-t border-white/50 text-sm text-slate-700 ${onSelectIncident ? "cursor-pointer transition hover:bg-white/40" : ""}`}
                  onClick={onSelectIncident ? () => onSelectIncident(incident) : undefined}
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {incident.alert_name}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={incident.severity} variant="severity" />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={incident.status} variant="status" />
                  </td>
                  <td className="px-6 py-4">{incident.instance ?? "--"}</td>
                  <td className="px-6 py-4">
                    {incident.summary ?? incident.description ?? "--"}
                  </td>
                  <td className="px-6 py-4">{formatDateTime(incident.starts_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col gap-3 border-t border-white/50 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredIncidents.length)} of {filteredIncidents.length} incidents
            </p>
            <Pagination className="mx-0 w-auto justify-start md:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((page) => Math.max(1, page - 1));
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((page) => Math.min(totalPages, page + 1));
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}
