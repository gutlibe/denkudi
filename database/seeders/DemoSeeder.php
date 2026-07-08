<?php

namespace Database\Seeders;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use App\Enums\VoteStatus;
use App\Models\AdminAuditLog;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Position;
use App\Models\User;
use App\Models\Vote;
use App\Services\VotingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding demo data...');

        // ── Ensure admin user exists ──
        $admin = User::firstOrCreate(
            ['email' => '0325080330@htu.edu.gh'],
            [
                'first_name' => 'Julius',
                'last_name' => 'Kalevor',
                'student_id' => '0325080330',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ],
        );

        if ($admin->role !== 'admin') {
            $admin->update(['role' => 'admin']);
        }

        $this->command->info(' Admin user: '.$admin->email.' (password: password)');

        // ── Create students ──
        $students = $this->createStudents();
        $this->command->info(' '.count($students).' student voters created.');

        // ── Create election with positions and candidates ──
        $election = $this->createElection($admin->id);
        $this->command->info(' Election: '.$election->title);

        $positions = $this->createPositions($election);
        $this->command->info(' '.count($positions).' positions created.');

        $candidates = $this->createCandidates($election, $positions);
        $this->command->info(' '.count($candidates).' candidates created.');

        // ── Cast votes ──
        $votingService = app(VotingService::class);
        $votedCount = 0;

        foreach ($students as $student) {
            $ballot = [];

            foreach ($positions as $position) {
                $positionCandidates = $candidates->where('position_id', $position->id);
                $pick = $positionCandidates->random();

                $ballot[] = [
                    'position_id' => $position->id,
                    'candidate_id' => $pick->id,
                ];
            }

            try {
                $result = $votingService->castBallot($election, $student->student_id, $ballot);
                $votedCount++;

                if ($votedCount === 1) {
                    $this->command->info(" First ballot cast. Receipt: {$result['receipt']}");
                }
            } catch (\Exception $e) {
                $this->command->warn(" Could not cast ballot for {$student->first_name}: {$e->getMessage()}");
            }
        }

        $this->command->info(" {$votedCount} ballots cast ({$votedCount} × ".count($positions).' positions = '.($votedCount * count($positions)).' vote rows)');

        // ── Create one quarantined vote (tampered hash) ──
        $lastValidVote = Vote::where('election_id', $election->id)
            ->where('status', VoteStatus::Valid)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastValidVote) {
            $bogusVote = Vote::create([
                'election_id' => $election->id,
                'position_id' => $positions->first()->id,
                'candidate_id' => $candidates->first()->id,
                'receipt_token' => 'HTU-TAMP-ERED-DEMO',
                'previous_hash' => $lastValidVote->current_hash,
                'current_hash' => hash_hmac('sha256', 'tampered-data', 'wrong-key'),
                'status' => VoteStatus::Valid,
            ]);

            $election->increment('quarantine_count');

            AdminAuditLog::create([
                'admin_id' => $admin->id,
                'action' => 'demo_tampered',
                'description' => 'Demo: Tampered vote #'.$bogusVote->id.' inserted for demonstration purposes.',
                'metadata' => ['election_id' => $election->id, 'vote_id' => $bogusVote->id],
                'created_at' => now(),
            ]);

            // Flag it so the integrity scan picks it up
            $bogusVote->update(['status' => VoteStatus::Quarantined]);
            $this->command->warn(' 1 quarantined vote created (hash mismatch demo).');
        }

        // ── Log admin actions for dashboard activity feed ──
        AdminAuditLog::create([
            'admin_id' => $admin->id,
            'action' => 'election_created',
            'description' => "Election \"{$election->title}\" created.",
            'metadata' => ['election_id' => $election->id],
            'created_at' => now()->subHours(2),
        ]);

        AdminAuditLog::create([
            'admin_id' => $admin->id,
            'action' => 'election_status_changed',
            'description' => "Election \"{$election->title}\" moved from draft to scheduled.",
            'metadata' => ['election_id' => $election->id, 'from' => 'draft', 'to' => 'scheduled'],
            'created_at' => now()->subHours(1),
        ]);

        AdminAuditLog::create([
            'admin_id' => $admin->id,
            'action' => 'election_status_changed',
            'description' => "Election \"{$election->title}\" moved from scheduled to active.",
            'metadata' => ['election_id' => $election->id, 'from' => 'scheduled', 'to' => 'active'],
            'created_at' => now()->subMinutes(30),
        ]);

        $this->command->info(' Demo data seeded successfully!');
        $this->command->info('');
        $this->command->info(' Login credentials:');
        $this->command->info('   Admin: 0325080330@htu.edu.gh');
        $this->command->info('   Students: <student_id>@htu.edu.gh');
        $this->command->info('   Password (all): password');
    }

    /**
     * @return Collection<int, User>
     */
    private function createStudents(): Collection
    {
        $studentIds = [
            ['first_name' => 'Akua',     'last_name' => 'Mensah',    'sid' => '0325010001'],
            ['first_name' => 'Kwame',    'last_name' => 'Asante',    'sid' => '0325010002'],
            ['first_name' => 'Abena',    'last_name' => 'Owusu',     'sid' => '0325010003'],
            ['first_name' => 'Yaw',      'last_name' => 'Darko',     'sid' => '0325010004'],
            ['first_name' => 'Afia',     'last_name' => 'Boateng',   'sid' => '0325010005'],
            ['first_name' => 'Kofi',     'last_name' => 'Amoah',     'sid' => '0325010006'],
            ['first_name' => 'Esi',      'last_name' => 'Appiah',    'sid' => '0325010007'],
            ['first_name' => 'Kwesi',    'last_name' => 'Tetteh',    'sid' => '0325010008'],
            ['first_name' => 'Adwoa',    'last_name' => 'Baffour',   'sid' => '0325010009'],
            ['first_name' => 'Kojo',     'last_name' => 'Annan',     'sid' => '0325010010'],
        ];

        $students = collect();

        foreach ($studentIds as $s) {
            $students->push(
                User::firstOrCreate(
                    ['email' => $s['sid'].'@htu.edu.gh'],
                    [
                        'first_name' => $s['first_name'],
                        'last_name' => $s['last_name'],
                        'student_id' => $s['sid'],
                        'password' => Hash::make('password'),
                        'role' => 'student',
                        'email_verified_at' => now(),
                    ],
                )
            );
        }

        // Ensure Mankal exists as student too
        User::firstOrCreate(
            ['email' => '0325038383@htu.edu.gh'],
            [
                'first_name' => 'Mankal',
                'last_name' => 'Llucia',
                'student_id' => '0325038383',
                'password' => Hash::make('password'),
                'role' => 'student',
                'email_verified_at' => now(),
            ],
        );

        return $students;
    }

    private function createElection(int $adminId): Election
    {
        return Election::create([
            'title' => '2026 SRC Presidential Election',
            'slug' => '2026-src-presidential-'.Str::random(6),
            'type' => ElectionType::StudentBody,
            'scope' => 'HTU Main Campus',
            'description' => 'Elect the next Student Representative Council leadership for the 2026/2027 academic year.',
            'status' => ElectionStatus::Active,
            'starts_at' => now()->subDays(2),
            'ends_at' => now()->addDays(5),
            'created_by' => $adminId,
        ]);
    }

    /**
     * @return Collection<int, Position>
     */
    private function createPositions(Election $election): Collection
    {
        $data = [
            ['title' => 'President',           'max_selections' => 1, 'sort_order' => 1],
            ['title' => 'Vice President',      'max_selections' => 1, 'sort_order' => 2],
            ['title' => 'General Secretary',   'max_selections' => 1, 'sort_order' => 3],
            ['title' => 'Treasurer',           'max_selections' => 1, 'sort_order' => 4],
        ];

        $positions = collect();

        foreach ($data as $d) {
            $positions->push(
                Position::create([
                    'election_id' => $election->id,
                    'title' => $d['title'],
                    'max_selections' => $d['max_selections'],
                    'sort_order' => $d['sort_order'],
                ])
            );
        }

        return $positions;
    }

    /**
     * @param  Collection<int, Position>  $positions
     * @return Collection<int, Candidate>
     */
    private function createCandidates(Election $election, Collection $positions): Collection
    {
        $slate = [
            'President' => [
                ['name' => 'Samuel Owusu',       'department' => 'Computer Science'],
                ['name' => 'Grace Asante',       'department' => 'Business Administration'],
                ['name' => 'Emmanuel Darko',     'department' => 'Electrical Engineering'],
            ],
            'Vice President' => [
                ['name' => 'Patricia Mensah',    'department' => 'Accounting'],
                ['name' => 'Isaac Boateng',      'department' => 'Marketing'],
                ['name' => 'Diana Amoah',        'department' => 'Human Resources'],
            ],
            'General Secretary' => [
                ['name' => 'Michael Tetteh',     'department' => 'Information Technology'],
                ['name' => 'Rebecca Appiah',     'department' => 'Communication Studies'],
                ['name' => 'Joseph Baffour',    'department' => 'Economics'],
            ],
            'Treasurer' => [
                ['name' => 'Esther Annan',       'department' => 'Finance'],
                ['name' => 'Benjamin Kumi',      'department' => 'Banking'],
                ['name' => 'Lydia Nyarko',       'department' => 'Procurement'],
            ],
        ];

        $candidates = collect();

        foreach ($positions as $position) {
            foreach ($slate[$position->title] as $c) {
                $candidates->push(
                    Candidate::create([
                        'election_id' => $election->id,
                        'position_id' => $position->id,
                        'name' => $c['name'],
                        'department' => $c['department'],
                    ])
                );
            }
        }

        return $candidates;
    }
}
