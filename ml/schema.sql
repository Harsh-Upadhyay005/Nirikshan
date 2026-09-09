CREATE TABLE ministries (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE agencies (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_code INTEGER UNIQUE NOT NULL,   
    project_name TEXT NOT NULL,
    ministry_id INTEGER REFERENCES ministries(id),
    category_id INTEGER REFERENCES categories(id),
    agency_id INTEGER REFERENCES agencies(id),
    legacy_ocms_code TEXT,                  
    pmgid TEXT,                             
    is_multi_state BOOLEAN DEFAULT FALSE,
    approval_date DATE,                     
    start_date DATE NOT NULL,
    target_doc DATE,
    original_cost_cr NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE project_states (
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    state_id INTEGER REFERENCES states(id),
    PRIMARY KEY (project_id, state_id)
);


CREATE TABLE project_snapshots (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    report_month DATE NOT NULL,             
    revised_doc DATE,                       
    revised_cost_cr NUMERIC(12,2),
    cumulative_expenditure_cr NUMERIC(12,2),
    physical_progress_pct NUMERIC(5,2),
    is_delayed BOOLEAN,
    is_cost_overrun BOOLEAN,
    schedule_slippage_months INTEGER,
    cost_overrun_pct NUMERIC(8,2),
    UNIQUE (project_id, report_month)       -- one snapshot per project per month
);


CREATE TABLE risk_predictions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    snapshot_id INTEGER REFERENCES project_snapshots(id) ON DELETE CASCADE,
    model_version TEXT NOT NULL,           
    delay_probability NUMERIC(5,4),
    cost_overrun_probability NUMERIC(5,4),
    expected_slippage_months NUMERIC(6,2),
    expected_overrun_value_cr NUMERIC(12,2),
    risk_segment TEXT,
    risk_score NUMERIC(8,4),
    needs_alert BOOLEAN DEFAULT FALSE,
    predicted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_snapshots_project ON project_snapshots(project_id);
CREATE INDEX idx_snapshots_month ON project_snapshots(report_month);
CREATE INDEX idx_predictions_project ON risk_predictions(project_id);
CREATE INDEX idx_predictions_alert ON risk_predictions(needs_alert) WHERE needs_alert = TRUE;