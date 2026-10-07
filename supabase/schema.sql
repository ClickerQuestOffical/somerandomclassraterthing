-- Supabase schema for ClassReview
-- This schema defines the tables for teachers, reviews, and reports

-- Teachers table
create table teachers (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    subject text not null,
    description text,
    image_url text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reviews table
create table reviews (
    id uuid primary key default uuid_generate_v4(),
    teacher_id uuid not null references teachers(id) on delete cascade,
    anonymous_user_id uuid not null default uuid_generate_v4(),
    vote text not null check (vote in ('positive', 'negative')),
    comment text,
    status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reports table
create table reports (
    id uuid primary key default uuid_generate_v4(),
    review_id uuid not null references reviews(id) on delete cascade,
    reason text not null check (reason in ('harassment', 'personal_information', 'spam', 'inappropriate_content', 'threat', 'other')),
    details text,
    reporter_id uuid not null default uuid_generate_v4(),
    status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index ix_reviews_teacher_id on reviews(teacher_id);
create index ix_reviews_created_at on reviews(created_at);
create index ix_reviews_vote on reviews(vote);
create index ix_reviews_status on reviews(status);
create index ix_reviews_anonymous_user_id on reviews(anonymous_user_id);
create index ix_teacher_id_created_at on reviews(teacher_id, created_at desc);

-- Optional: Create a view for teacher review statistics
create view teacher_review_stats as
select
    t.id as teacher_id,
    t.name as teacher_name,
    t.subject as teacher_subject,
    count(r.id) filter (where r.vote = 'positive' and r.status = 'approved') as positive_count,
    count(r.id) filter (where r.vote = 'negative' and r.status = 'approved') as negative_count,
    count(r.id) filter (where r.status = 'approved') as total_reviews,
    case
        when count(r.id) filter (where r.status = 'approved') = 0 then 0
        else round(
            100.0 * count(r.id) filter (where r.vote = 'positive' and r.status = 'approved')
            / count(r.id) filter (where r.status = 'approved')
        )
    end as positive_percentage
from teachers t
left join reviews r on t.id = r.teacher_id and r.status = 'approved'
where t.is_active = true
group by t.id, t.name, t.subject;

-- Enable Row Level Security (RLS)
alter table teachers enable row level security;
alter table reviews enable row level security;
alter table reports enable row level security;

-- Policies for teachers
create policy "Teachers are viewable by everyone"
on teachers for select
using (true);

-- Policies for reviews
create policy "Approved reviews are viewable by everyone"
on reviews for select
using (status = 'approved');

create policy "Users can insert reviews"
on reviews for insert
with check (true);

create policy "Users can update their own reviews"
on reviews for update
using (anonymous_user_id = coalesce(current_setting('app.anonymous_user_id')::uuid, auth.uid()));

create policy "Users can delete their own reviews"
on reviews for delete
using (anonymous_user_id = coalesce(current_setting('app.anonymous_user_id')::uuid, auth.uid()));

-- Policies for reports
create policy "Reports are viewable by everyone"
on reports for select
using (true);

create policy "Users can insert reports"
on reports for insert
with check (true);