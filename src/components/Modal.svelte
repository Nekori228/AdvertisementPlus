<script>
    import { createEventDispatcher } from 'svelte';

    export let isOpen = false;
    export let content = "";

    const dispatch = createEventDispatcher();

    function closeModal() {
        dispatch('close');
    }
</script>

{#if isOpen}
    <div class="modal-overlay" on:click={closeModal}>
        <div class="modal-content" on:click|stopPropagation>
            <img class="modal-image" src="img/backModal2.png">
            <div class="modal-body">
                {content}
                <button class="close-button" on:click={closeModal}>×</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        background-color: rgba(0, 0, 0, 0.5);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        position: relative;
        width: 45%;
        height: 60%;
        border-radius: 8px;
        overflow: hidden;
    }

    .modal-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
    }

    .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 1.5em;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.7);
        z-index: 1;
    }
    
    .modal-body {
        padding: 20px;
        font-size: 1em;
        z-index: 1;
    }
</style>
