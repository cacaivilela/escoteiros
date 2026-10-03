extends CharacterBody3D
# Este é o script que o próprio Godot gera ao criar um CharacterBody3D ("Basic Movement" template).
# Código realmente NOSSO: só as linhas marcadas com  # <- nosso  (câmera girando com o mouse), 7 linhas.

const SPEED = 5.0
const JUMP_VELOCITY = 4.5

@onready var pivo: Node3D = $Pivo               # <- nosso: o pivô da câmera (SpringArm3D cuida da colisão)


func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED   # <- nosso


func _unhandled_input(event: InputEvent) -> void:  # <- nosso: mouse gira a câmera em volta do boneco
	if event is InputEventMouseMotion:
		pivo.rotate_y(-event.relative.x * 0.003)
		$Pivo/Braco.rotation.x = clamp($Pivo/Braco.rotation.x - event.relative.y * 0.003, -1.2, 0.3)
	if event.is_action_pressed("ui_cancel"):
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func _physics_process(delta: float) -> void:
	# Add the gravity.
	if not is_on_floor():
		velocity += get_gravity() * delta

	# Handle jump.
	if Input.is_action_just_pressed("ui_accept") and is_on_floor():
		velocity.y = JUMP_VELOCITY

	# Get the input direction and handle the movement/deceleration.
	# As good practice, you should replace UI actions with custom gameplay actions.
	var input_dir := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	var direction := (pivo.global_transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()   # <- nosso: relativo à câmera (o template usava transform.basis)
	direction.y = 0   # <- nosso
	if direction:
		velocity.x = direction.x * SPEED
		velocity.z = direction.z * SPEED
	else:
		velocity.x = move_toward(velocity.x, 0, SPEED)
		velocity.z = move_toward(velocity.z, 0, SPEED)

	move_and_slide()
