<?php

namespace Tests\Feature;

use App\Models\Workflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class WorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_see_workflows_list(): void
    {
        $this->actingAs($this->user);

        Workflow::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->user->current_project_id,
        ]);

        $this->get(route('workflows'))
            ->assertSuccessful()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('workflows/index'));
    }

    public function test_see_workflow(): void
    {
        $this->actingAs($this->user);

        /** @var Workflow $workflow */
        $workflow = Workflow::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->user->current_project_id,
        ]);

        $this->get(route('workflows.show', $workflow))
            ->assertSuccessful()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('workflows/show'));
    }

    public function test_create_workflow(): void
    {
        $this->actingAs($this->user);

        $this->post(route('workflows.store'), [
            'name' => 'My Workflow',
        ])->assertRedirect();

        $this->assertDatabaseHas('workflows', [
            'project_id' => $this->user->current_project_id,
            'name' => 'My Workflow',
        ]);
    }

    public function test_delete_workflow(): void
    {
        $this->actingAs($this->user);

        /** @var Workflow $workflow */
        $workflow = Workflow::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->user->current_project_id,
        ]);

        $this->delete(route('workflows.destroy', $workflow))
            ->assertRedirect();

        $this->assertSoftDeleted('workflows', [
            'id' => $workflow->id,
        ]);
    }
}
