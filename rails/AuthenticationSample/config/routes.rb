Rails.application.routes.draw do
  root to: "home#index"
  use_doorkeeper
  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }

  get 'home/index'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

end
