-- Supabase seed data for ClassReview
-- This is TEST DATA and must be replaced before deployment

-- Teachers
insert into teachers (id, name, subject, description, is_active) values
('11111111-1111-1111-1111-111111111101', 'Mrs. Kielb', 'Science', '8th grade science teacher', true),
('11111111-1111-1111-1111-111111111102', 'Mrs. Winkler', 'Foods', 'Foods and nutrition teacher', true),
('11111111-1111-1111-1111-111111111103', 'Mr. Brossy', 'PE', 'Physical education teacher', true),
('11111111-1111-1111-1111-111111111104', 'Ms. Common', 'US History', 'United States history teacher', true),
('11111111-1111-1111-1111-111111111105', 'Ms. Maranowski', 'Math', 'Mathematics teacher', true),
('11111111-1111-1111-1111-111111111106', 'Mrs. Khalil', 'ELA', 'English language arts teacher', true),
('11111111-1111-1111-1111-111111111107', 'Ms. Cooley', 'Science', 'Science teacher', true),
('11111111-1111-1111-1111-111111111108', 'Ms. Schulza', 'US History', 'United States history teacher', true),
('11111111-1111-1111-1111-111111111109', 'Ms. Gruber', 'Computers', 'Computer science teacher', true),
('11111111-1111-1111-1111-111111111110', 'Ms. Burchard', 'ELA', 'English language arts teacher', true),
('11111111-1111-1111-1111-111111111111', 'Ms. Gasidlo', 'Science', 'Science teacher', true),
('11111111-1111-1111-1111-111111111112', 'Coach Taylor', 'Football', 'Football coach', true),
('11111111-1111-1111-1111-111111111113', 'Coach Duke', 'Football', 'Football coach', true),
('11111111-1111-1111-1111-111111111114', 'Coach Frank', 'Football', 'Football coach', true),
('11111111-1111-1111-1111-111111111115', 'Coach Satterwhite', 'Football', 'Football coach', true);

-- Sample reviews for Mrs. Kielb (Science) - Overwhelmingly Positive (95%)
insert into reviews (id, teacher_id, anonymous_user_id, vote, comment, status) values
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333301', 'positive', 'Mrs. Kielb makes science fun and easy to understand. She does lots of hands-on labs.', 'approved'),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333302', 'positive', 'She explains things clearly and is always willing to help.', 'approved'),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333303', 'positive', 'I love her class! She makes learning enjoyable.', 'approved'),
('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333304', 'positive', 'Great teacher, very knowledgeable about science.', 'approved'),
('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333305', 'positive', 'She makes difficult concepts easy to grasp.', 'approved'),
('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333306', 'positive', 'Her class is always engaging and interactive.', 'approved'),
('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333307', 'positive', 'She cares about her students'' success.', 'approved'),
('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333308', 'positive', 'One of my favorite teachers!', 'approved'),
('22222222-2222-2222-2222-222222222209', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333309', 'positive', 'She makes science relevant to real life.', 'approved'),
('22222222-2222-2222-2222-222222222210', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333310', 'positive', 'Her enthusiasm is contagious.', 'approved'),
('22222222-2222-2222-2222-222222222211', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333311', 'negative', 'Sometimes moves too fast for me.', 'approved');

-- Sample reviews for Mr. Brossy (PE) - Mixed (50%)
insert into reviews (id, teacher_id, anonymous_user_id, vote, comment, status) values
('22222222-2222-2222-2222-222222222212', '11111111-1111-1111-1111-111111111103', '33333333-3333-3333-3333-333333333312', 'positive', 'Coach Brossy makes PE fun and inclusive.', 'approved'),
('22222222-2222-2222-2222-222222222213', '11111111-1111-1111-1111-111111111103', '33333333-3333-3333-3333-333333333313', 'positive', 'He encourages everyone to participate.', 'approved'),
('22222222-2222-2222-2222-222222222214', '11111111-1111-1111-1111-111111111103', '33333333-3333-3333-3333-333333333314', 'negative', 'Sometimes too competitive.', 'approved'),
('22222222-2222-2222-2222-222222222215', '11111111-1111-1111-1111-111111111103', '33333333-3333-3333-3333-333333333315', 'negative', 'Wish we had more variety in activities.', 'approved');

-- Sample reviews for Ms. Maranowski (Math) - Very Negative (15%)
insert into reviews (id, teacher_id, anonymous_user_id, vote, comment, status) values
('22222222-2222-2222-2222-222222222216', '11111111-1111-1111-1111-111111111105', '33333333-3333-3333-3333-333333333316', 'positive', 'She tries to help but moves too fast.', 'approved'),
('22222222-2222-2222-2222-222222222217', '11111111-1111-1111-1111-111111111105', '33333333-3333-3333-3333-333333333317', 'negative', 'Math is hard enough without her making it confusing.', 'approved'),
('22222222-2222-2222-2222-222222222218', '11111111-1111-1111-1111-111111111105', '33333333-3333-3333-3333-333333333318', 'negative', 'Her explanations are unclear.', 'approved'),
('22222222-2222-2222-2222-222222222219', '11111111-1111-1111-1111-111111111105', '33333333-3333-3333-3333-333333333319', 'negative', 'I struggle to keep up in her class.', 'approved'),
('22222222-2222-2222-2222-222222222220', '11111111-1111-1111-1111-111111111105', '33333333-3333-3333-3333-333333333320', 'negative', 'Too much homework, not enough in-class practice.', 'approved');

-- Sample reviews for Ms. Common (US History) - No Reviews
-- (No reviews inserted for this teacher)

-- Sample reviews for Coach Taylor (Football) - Very Negative (10%)
insert into reviews (id, teacher_id, anonymous_user_id, vote, comment, status) values
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333321', 'positive', 'Coach Taylor knows football well.', 'approved'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333322', 'negative', 'Practices are too intense.', 'approved'),
('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333323', 'negative', 'He plays favorites.', 'approved'),
('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333324', 'negative', 'Not enough focus on skill development.', 'approved'),
('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333325', 'negative', 'Too much conditioning, not enough technique.', 'approved'),
('22222222-2222-2222-2222-222222222226', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333326', 'negative', 'His attitude can be discouraging.', 'approved'),
('22222222-2222-2222-2222-222222222227', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333327', 'negative', 'Wish he was more encouraging.', 'approved'),
('22222222-2222-2222-2222-222222222228', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333328', 'negative', 'Sometimes unfair in his assessments.', 'approved'),
('22222222-2222-2222-2222-222222222229', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333329', 'negative', 'Needs to work on communication with players.', 'approved'),
('22222222-2222-2222-2222-222222222230', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333330', 'negative', 'Overall experience was negative.', 'approved');

-- Note: This is TEST DATA and must be replaced with real data before deployment
-- Never use real teacher or student information in this seed data