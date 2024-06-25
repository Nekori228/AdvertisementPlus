<!-- Modal.svelte -->
<script>
    export let isOpen = false;
    export let content = "";
    export let onClose;

    function closeModal() {
        if (typeof onClose === 'function') {
            onClose();
        }
    }
</script>

{#if isOpen}
    <div class="modal-overlay">
        <div class="background-photo"></div>
        <div class="modal-content" on:click|stopPropagation>
            <button class="close-button" on:click={closeModal}>×</button>
            <div class="modal-body">
                {content}
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        background-image: url('backModal2.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
    .background-photo {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1; /* Ensure it's behind modal-content */
        background-image: inherit;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        filter: blur(4px); /* Optional: Add blur effect to the background */
    }
    .modal-content {
        background: rgba(255, 255, 255, 0.8); /* Transparent white background */
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        position: relative;
        max-width: 80%; /* Adjust as needed */
        max-height: 80%; /* Adjust as needed */
        overflow-y: auto; /* Enable scrolling if content overflows */
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
    }
    .modal-body {
        padding: 20px;
        font-size: 1em;
    }
</style>
