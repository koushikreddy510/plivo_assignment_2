import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  Link,
  useLocation,
} from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  Operational: "#22c55e", // green
  "Degraded Performance": "#eab308", // yellow
  "Partial Outage": "#f97316", // orange
  "Major Outage": "#ef4444", // red
};

const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : process.env.REACT_APP_API_BASE_URL;

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 999,
        color: "#fff",
        fontSize: 12,
        fontWeight: 600,
        background: STATUS_COLORS[status] || "#6b7280",
      }}>
      {status}
    </span>
  );
}

function isAuthenticated() {
  return Boolean(localStorage.getItem("admin_jwt"));
}

function requireAuth(Component: React.FC) {
  return function Wrapper(props: any) {
    const location = useLocation();
    if (!isAuthenticated()) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Component {...props} />;
  };
}

function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/admin/services";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("admin_jwt", data.token);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
        Admin Login
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          Username
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #e5e7eb",
              marginTop: 4,
            }}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #e5e7eb",
              marginTop: 4,
            }}
          />
        </label>
        {error && <div style={{ color: "#ef4444" }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "#f3f4f6",
            fontWeight: 600,
            cursor: "pointer",
          }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

function AdminLogoutButton() {
  const navigate = useNavigate();
  if (!isAuthenticated()) return null;
  return (
    <button
      onClick={() => {
        localStorage.removeItem("admin_jwt");
        navigate("/admin/login");
      }}
      style={{
        margin: 16,
        padding: "6px 14px",
        borderRadius: 6,
        border: "1px solid #e5e7eb",
        background: "#fff",
        fontWeight: 600,
        cursor: "pointer",
        float: "right",
      }}>
      Logout
    </button>
  );
}

function fetchWithAuth(url: string, options: any = {}) {
  const token = localStorage.getItem("admin_jwt");
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json",
    },
  });
}

function StatusPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 24,
          textAlign: "center",
        }}>
        Service Status
      </h1>
      {loading && (
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          Loading services...
        </div>
      )}
      {error && (
        <div style={{ textAlign: "center", color: "#ef4444" }}>{error}</div>
      )}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {services.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9ca3af" }}>
              No services found.
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  borderRadius: 8,
                  padding: 16,
                  border: "1px solid #e5e7eb",
                }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>
                    {service.name}
                  </div>
                  {service.description && (
                    <div style={{ color: "#6b7280", fontSize: 14 }}>
                      {service.description}
                    </div>
                  )}
                </div>
                <StatusBadge status={service.status} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AdminServiceList() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchServices = () => {
    setLoading(true);
    fetchWithAuth(`${API_BASE_URL}/api/services`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    await fetchWithAuth(`${API_BASE_URL}/api/services/${id}`, {
      method: "DELETE",
    });
    fetchServices();
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 16 }}>
      <AdminLogoutButton />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Admin: Manage Services
      </h1>
      <button
        onClick={() => navigate("/admin/services/new")}
        style={{
          marginBottom: 20,
          padding: "8px 16px",
          fontWeight: 600,
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          background: "#f3f4f6",
          cursor: "pointer",
        }}>
        + Add Service
      </button>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "#ef4444" }}>{error}</div>}
      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ textAlign: "left", padding: 8 }}>Name</th>
              <th style={{ textAlign: "left", padding: 8 }}>Description</th>
              <th style={{ textAlign: "left", padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service._id}
                style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: 8 }}>{service.name}</td>
                <td style={{ padding: 8 }}>{service.description}</td>
                <td style={{ padding: 8 }}>
                  <StatusBadge status={service.status} />
                </td>
                <td style={{ padding: 8 }}>
                  <button
                    onClick={() =>
                      navigate(`/admin/services/${service._id}/edit`)
                    }
                    style={{
                      marginRight: 8,
                      padding: "4px 10px",
                      borderRadius: 4,
                      border: "1px solid #e5e7eb",
                      background: "#f3f4f6",
                      cursor: "pointer",
                    }}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      border: "1px solid #ef4444",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      cursor: "pointer",
                    }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AdminServiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Operational",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetchWithAuth(`${API_BASE_URL}/api/services/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch service");
          return res.json();
        })
        .then((data) => {
          setForm({
            name: data.name,
            description: data.description,
            status: data.status,
          });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `${API_BASE_URL}/api/services/${id}`
        : `${API_BASE_URL}/api/services`;
      const fetchFn = isEdit ? fetchWithAuth : fetchWithAuth;
      const res = await fetchFn(url, {
        method,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save service");
      navigate("/admin/services");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 16 }}>
      <AdminLogoutButton />
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
        {isEdit ? "Edit Service" : "Add Service"}
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #e5e7eb",
              marginTop: 4,
            }}
          />
        </label>
        <label>
          Description
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #e5e7eb",
              marginTop: 4,
            }}
          />
        </label>
        <label>
          Status
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #e5e7eb",
              marginTop: 4,
            }}>
            <option value="Operational">Operational</option>
            <option value="Degraded Performance">Degraded Performance</option>
            <option value="Partial Outage">Partial Outage</option>
            <option value="Major Outage">Major Outage</option>
          </select>
        </label>
        {error && <div style={{ color: "#ef4444" }}>{error}</div>}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#f3f4f6",
              fontWeight: 600,
              cursor: "pointer",
            }}>
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/services")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/status" element={<StatusPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/services"
        element={React.createElement(requireAuth(AdminServiceList))}
      />
      <Route
        path="/admin/services/new"
        element={React.createElement(requireAuth(AdminServiceForm))}
      />
      <Route
        path="/admin/services/:id/edit"
        element={React.createElement(requireAuth(AdminServiceForm))}
      />
      {/* Redirect root to /status */}
      <Route path="/" element={<Navigate to="/status" replace />} />
    </Routes>
  );
}

export default App;
