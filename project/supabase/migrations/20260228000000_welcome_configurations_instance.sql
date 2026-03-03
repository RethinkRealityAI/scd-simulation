-- Add instance_id to welcome_configurations to support instance-specific welcome screens

ALTER TABLE public.welcome_configurations 
ADD COLUMN instance_id UUID REFERENCES public.simulation_instances(id) ON DELETE CASCADE;

-- Add an index for faster lookups by instance
CREATE INDEX IF NOT EXISTS welcome_configurations_instance_id_idx ON public.welcome_configurations(instance_id);
